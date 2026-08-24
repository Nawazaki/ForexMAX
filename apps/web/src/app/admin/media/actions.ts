"use server";

import { revalidatePath } from "next/cache";
import { requireDatabase, requireEditor } from "@/lib/admin";
import { imageUploadSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";

export async function updateMediaAltAction(id: string, formData: FormData) { await requireEditor(); const db = requireDatabase(); const parsed = imageUploadSchema.safeParse({ altText: formData.get("altText") }); if (!parsed.success) throw new Error("INVALID_ALT_TEXT"); await db.media.update({ where: { id }, data: { altText: parsed.data.altText } }); revalidatePath("/admin/media"); }
export async function deleteMediaAction(id: string) { await requireEditor(); const db = requireDatabase(); const media = await db.media.findUnique({ where: { id } }); if (!media) return; const supabase = await createClient(); const { error } = await supabase.storage.from("media").remove([media.key]); if (error) throw new Error("STORAGE_DELETE_FAILED"); await db.media.delete({ where: { id } }); revalidatePath("/admin/media"); }
