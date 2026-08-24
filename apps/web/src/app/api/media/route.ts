import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { requireDatabase, requireEditor } from "@/lib/admin";
import { validateImageUpload } from "@/lib/media";
import { imageUploadSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await requireEditor(); const db = requireDatabase();
    if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
    const form = await request.formData(); const file = form.get("file"); const parsed = imageUploadSchema.safeParse({ altText: form.get("altText") });
    if (!parsed.success || !(file instanceof File)) return NextResponse.json({ error: "Provide an image file and meaningful alt text." }, { status: 400 });
    const extension = validateImageUpload(file); if (!extension) return NextResponse.json({ error: "Only matching JPEG, PNG, WebP or AVIF files up to 5 MB are allowed." }, { status: 400 });
    const blob = await put(`media/${crypto.randomUUID()}.${extension}`, file, { access: "public", token: process.env.BLOB_READ_WRITE_TOKEN, addRandomSuffix: false });
    const media = await db.media.create({ data: { key: blob.pathname, url: blob.url, filename: file.name, mimeType: file.type, sizeBytes: file.size, altText: parsed.data.altText } });
    return NextResponse.json({ id: media.id, url: media.url }, { status: 201 });
  } catch (error) { const unauthorised = error instanceof Error && error.message === "UNAUTHORIZED"; return NextResponse.json({ error: unauthorised ? "Unauthorised." : "Upload could not be completed." }, { status: unauthorised ? 401 : 500 }); }
}
