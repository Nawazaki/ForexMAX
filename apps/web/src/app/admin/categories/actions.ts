"use server";
import { revalidatePath } from "next/cache";
import { requireDatabase, requireEditor } from "@/lib/admin";
import { categoryInputSchema } from "@/lib/validation";
const nullable = (value: FormDataEntryValue | null) => { const text = String(value ?? "").trim(); return text || null; };
const payload = (formData: FormData) => categoryInputSchema.parse({ name: formData.get("name"), slug: formData.get("slug"), description: nullable(formData.get("description")), seoTitle: nullable(formData.get("seoTitle")), seoDescription: nullable(formData.get("seoDescription")) });
export async function createCategoryAction(formData: FormData) { await requireEditor(); const db = requireDatabase(); await db.category.create({ data: payload(formData) }); revalidatePath("/admin/categories"); }
export async function updateCategoryAction(id: string, formData: FormData) { await requireEditor(); const db = requireDatabase(); await db.category.update({ where: { id }, data: payload(formData) }); revalidatePath("/admin/categories"); }
export async function deleteCategoryAction(id: string) { await requireEditor(); const db = requireDatabase(); await db.category.delete({ where: { id } }); revalidatePath("/admin/categories"); }
