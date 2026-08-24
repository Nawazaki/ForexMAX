import { NextResponse } from "next/server";
import { requireDatabase, requireEditor } from "@/lib/admin";
import { validateImageUpload } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import { imageUploadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireEditor(); const db = requireDatabase(); const supabase = await createClient();
    const form = await request.formData(); const file = form.get("file"); const parsed = imageUploadSchema.safeParse({ altText: form.get("altText") });
    if (!parsed.success || !(file instanceof File)) return NextResponse.json({ error: "Provide an image file and meaningful alt text." }, { status: 400 });
    const extension = validateImageUpload(file); if (!extension) return NextResponse.json({ error: "Only matching JPEG, PNG, WebP or AVIF files up to 5 MB are allowed." }, { status: 400 });
    const key = `uploads/${crypto.randomUUID()}.${extension}`; const { error: uploadError } = await supabase.storage.from("media").upload(key, file, { contentType: file.type, upsert: false }); if (uploadError) return NextResponse.json({ error: "Storage upload was rejected." }, { status: 503 });
    const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(key); const media = await db.media.create({ data: { key, url: publicUrl.publicUrl, filename: file.name, mimeType: file.type, sizeBytes: file.size, altText: parsed.data.altText } });
    return NextResponse.json({ id: media.id, url: media.url }, { status: 201 });
  } catch (error) { const unauthorised = error instanceof Error && error.message === "UNAUTHORIZED"; return NextResponse.json({ error: unauthorised ? "Unauthorised." : "Upload could not be completed." }, { status: unauthorised ? 401 : 500 }); }
}
