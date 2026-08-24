"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { requireDatabase, requireEditor } from "@/lib/admin";
import { imageUploadSchema } from "@/lib/validation";

export async function updateMediaAltAction(id: string, formData: FormData) { await requireEditor(); const db = requireDatabase(); const parsed = imageUploadSchema.safeParse({ altText: formData.get("altText") }); if (!parsed.success) throw new Error("INVALID_ALT_TEXT"); await db.media.update({ where: { id }, data: { altText: parsed.data.altText } }); revalidatePath("/admin/media"); }
export async function deleteMediaAction(id: string) { await requireEditor(); const db = requireDatabase(); const media = await db.media.findUnique({ where: { id } }); if (!media) return; if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_NOT_CONFIGURED"); await del(media.url, { token: process.env.BLOB_READ_WRITE_TOKEN }); await db.media.delete({ where: { id } }); revalidatePath("/admin/media"); }
