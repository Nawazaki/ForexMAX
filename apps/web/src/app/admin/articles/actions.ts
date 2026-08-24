"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { marked } from "marked";
import { requireDatabase, requireEditor } from "@/lib/admin";
import { assertPublishable } from "@/lib/editorial";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { articleInputSchema } from "@/lib/validation";
import { articleFormErrorCode } from "@/lib/article-form-errors";

function nullable(value: FormDataEntryValue | null) { const string = String(value ?? "").trim(); return string || null; }
function sourceInput(formData: FormData) { return { name: nullable(formData.get("sourceName")), url: nullable(formData.get("sourceUrl")), sourceType: nullable(formData.get("sourceType")) ?? "WEB", lastReviewedAt: nullable(formData.get("lastReviewedAt")) }; }
function validatePublication(status: string, source: ReturnType<typeof sourceInput>) { assertPublishable(status, source); }
async function contentPayload(formData: FormData) {
  const input = articleInputSchema.parse({ title: formData.get("title"), slug: formData.get("slug"), excerpt: nullable(formData.get("excerpt")), contentMarkdown: formData.get("contentMarkdown"), categoryId: nullable(formData.get("categoryId")), authorId: nullable(formData.get("authorId")), featuredMediaId: nullable(formData.get("featuredMediaId")), status: formData.get("status"), seoTitle: nullable(formData.get("seoTitle")), seoDescription: nullable(formData.get("seoDescription")), canonical: nullable(formData.get("canonical")), ogImage: nullable(formData.get("ogImage")) });
  const source = sourceInput(formData); validatePublication(input.status, source);
  const html = sanitizeRichHtml(await marked.parse(input.contentMarkdown));
  const tagIds = formData.getAll("tagIds").map(String).filter((id) => /^c[a-z0-9]+$/i.test(id)).slice(0, 20);
  return { input, source, html, tagIds };
}
function sourceRelation(source: ReturnType<typeof sourceInput>) { if (!source.name || !source.url) return undefined; return { create: { source: { connectOrCreate: { where: { url: source.url }, create: { name: source.name, url: source.url, sourceType: source.sourceType, accessedAt: source.lastReviewedAt ? new Date(source.lastReviewedAt) : null } } } } }; }
export async function createArticleAction(formData: FormData) {
  const session = await requireEditor(); const db = requireDatabase();
  let article;
  try {
    const { input, source, html, tagIds } = await contentPayload(formData);
    article = await db.article.create({ data: { ...input, contentHtml: html, editorId: session.user.id, publishedAt: input.status === "PUBLISHED" ? new Date() : null, lastReviewedAt: source.lastReviewedAt ? new Date(source.lastReviewedAt) : null, tags: { connect: tagIds.map((id) => ({ id })) }, sources: sourceRelation(source) } });
  } catch (error) {
    const code = articleFormErrorCode(error);
    if (code) redirect(`/admin/articles/new?error=${code}`);
    throw error;
  }
  revalidatePath("/articles"); revalidatePath("/admin/articles"); redirect(`/admin/articles/${article.id}`);
}
export async function updateArticleAction(id: string, formData: FormData) {
  const session = await requireEditor(); const db = requireDatabase();
  let inputSlug = "";
  try {
    const { input, source, html, tagIds } = await contentPayload(formData); inputSlug = input.slug;
    await db.article.update({ where: { id }, data: { ...input, contentHtml: html, editorId: session.user.id, publishedAt: input.status === "PUBLISHED" ? new Date() : null, lastReviewedAt: source.lastReviewedAt ? new Date(source.lastReviewedAt) : null, tags: { set: tagIds.map((tagId) => ({ id: tagId })) }, sources: source.name && source.url ? { deleteMany: {}, ...sourceRelation(source) } : { deleteMany: {} } } });
  } catch (error) {
    const code = articleFormErrorCode(error);
    if (code) redirect(`/admin/articles/${id}?error=${code}`);
    throw error;
  }
  revalidatePath("/articles"); revalidatePath(`/articles/${inputSlug}`); revalidatePath("/admin/articles"); revalidatePath(`/admin/articles/${id}`);
}
export async function deleteArticleAction(id: string) { await requireEditor(); const db = requireDatabase(); await db.article.delete({ where: { id } }); revalidatePath("/articles"); revalidatePath("/admin/articles"); redirect("/admin/articles"); }
