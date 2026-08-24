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
    const key = `uploads/${crypto.randomUUID()}.${extension}`; const { error: uploadError } = await supabase.storage.from("media").upload(key, file, { contentType: file.type, upsert: false }); if (uploadError) { console.error("Supabase Storage rejected media upload", { message: uploadError.message, name: uploadError.name }); return NextResponse.json({ error: "Storage rejected the upload. Confirm that the image is JPEG, PNG, WebP or AVIF and is no larger than 5 MB." }, { status: 503 }); }
    const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(key); let media; try { media = await db.media.create({ data: { key, url: publicUrl.publicUrl, filename: file.name, mimeType: file.type, sizeBytes: file.size, altText: parsed.data.altText } }); } catch (error) { await supabase.storage.from("media").remove([key]); console.error("Media metadata write failed after Storage upload", { message: error instanceof Error ? error.message : "Unknown error" }); return NextResponse.json({ error: "The image was stored but its media record could not be saved. The temporary upload was removed." }, { status: 500 }); }
    return NextResponse.json({ id: media.id, url: media.url }, { status: 201 });
  } catch (error) { const message = error instanceof Error ? error.message : "Unknown error"; const unauthorised = message === "UNAUTHORIZED"; console.error("Media upload failed", { message }); return NextResponse.json({ error: unauthorised ? "Unauthorised." : "Upload could not be completed. Please try again or contact an editor." }, { status: unauthorised ? 401 : 500 }); }
}
