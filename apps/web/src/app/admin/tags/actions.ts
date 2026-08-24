"use server";
import { revalidatePath } from "next/cache";
import { requireDatabase, requireEditor } from "@/lib/admin";
import { tagInputSchema } from "@/lib/validation";
const payload = (formData: FormData) => tagInputSchema.parse({ name: formData.get("name"), slug: formData.get("slug") });
export async function createTagAction(formData: FormData) { await requireEditor(); const db = requireDatabase(); await db.tag.create({ data: payload(formData) }); revalidatePath("/admin/tags"); }
export async function updateTagAction(id: string, formData: FormData) { await requireEditor(); const db = requireDatabase(); await db.tag.update({ where: { id }, data: payload(formData) }); revalidatePath("/admin/tags"); }
export async function deleteTagAction(id: string) { await requireEditor(); const db = requireDatabase(); await db.tag.delete({ where: { id } }); revalidatePath("/admin/tags"); }
