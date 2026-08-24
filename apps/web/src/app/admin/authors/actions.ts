"use server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { requireDatabase, requireEditor } from "@/lib/admin";
import { authorInputSchema } from "@/lib/validation";
const nullable = (value: FormDataEntryValue | null) => { const text = String(value ?? "").trim(); return text || null; };
function payload(formData: FormData) { const rawLinks = nullable(formData.get("socialLinks")); let socialLinks: Record<string, string> | null = null; if (rawLinks) { socialLinks = JSON.parse(rawLinks) as Record<string, string>; } const parsed = authorInputSchema.parse({ name: formData.get("name"), slug: formData.get("slug"), bio: nullable(formData.get("bio")), role: nullable(formData.get("role")), socialLinks }); return { ...parsed, socialLinks: parsed.socialLinks ?? Prisma.JsonNull }; }
export async function createAuthorAction(formData: FormData) { await requireEditor(); const db = requireDatabase(); await db.author.create({ data: payload(formData) }); revalidatePath("/admin/authors"); }
export async function updateAuthorAction(id: string, formData: FormData) { await requireEditor(); const db = requireDatabase(); await db.author.update({ where: { id }, data: payload(formData) }); revalidatePath("/admin/authors"); }
export async function deleteAuthorAction(id: string) { await requireEditor(); const db = requireDatabase(); await db.author.delete({ where: { id } }); revalidatePath("/admin/authors"); }
