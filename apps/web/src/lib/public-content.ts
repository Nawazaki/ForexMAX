import { getLegacyArticles, getLegacyAudits, getLegacyRecord, type LegacyKind, type LegacyRecord } from "@/lib/content";
import { getPrisma } from "@/lib/prisma";

export type PublicContent = { kind: "article" | "audit"; title: string; slug: string; route: string; description: string; contentHtml: string; ogImage?: string | null; updatedAt: Date; authorName?: string | null };
const asLegacy = (kind: "article" | "audit") => (record: LegacyRecord): PublicContent => ({ kind, title: record.title, slug: record.slug, route: record.route, description: record.description, contentHtml: record.contentHtml, ogImage: record.ogImage, updatedAt: new Date(record.migratedAt) });

export async function getPublishedArticles(): Promise<PublicContent[]> {
  const db = getPrisma(); if (!db) return getLegacyArticles().map(asLegacy("article"));
  const articles = await db.article.findMany({ where: { status: "PUBLISHED" }, include: { author: true }, orderBy: { publishedAt: "desc" } });
  return articles.map((article) => ({ kind: "article", title: article.title, slug: article.slug, route: `/articles/${article.slug}`, description: article.excerpt ?? article.seoDescription ?? "", contentHtml: article.contentHtml ?? "", ogImage: article.ogImage, updatedAt: article.updatedAt, authorName: article.author?.name }));
}

export async function getPublishedAudits(): Promise<PublicContent[]> {
  const db = getPrisma(); if (!db) return getLegacyAudits().map(asLegacy("audit"));
  const audits = await db.audit.findMany({ where: { status: "PUBLISHED" }, include: { author: true }, orderBy: { publishedAt: "desc" } });
  return audits.map((audit) => ({ kind: "audit", title: audit.title, slug: audit.slug, route: `/audits/${audit.slug}`, description: audit.summary ?? audit.seoDescription ?? "", contentHtml: audit.contentHtml ?? "", ogImage: audit.ogImage, updatedAt: audit.updatedAt, authorName: audit.author?.name }));
}

export async function getPublishedContent(kind: "article" | "audit", slug: string): Promise<PublicContent | undefined> {
  const db = getPrisma();
  if (!db) { const legacy = getLegacyRecord(kind as LegacyKind, slug); return legacy ? asLegacy(kind)(legacy) : undefined; }
  if (kind === "article") { const article = await db.article.findFirst({ where: { slug, status: "PUBLISHED" }, include: { author: true } }); return article ? { kind, title: article.title, slug: article.slug, route: `/articles/${article.slug}`, description: article.excerpt ?? article.seoDescription ?? "", contentHtml: article.contentHtml ?? "", ogImage: article.ogImage, updatedAt: article.updatedAt, authorName: article.author?.name } : undefined; }
  const audit = await db.audit.findFirst({ where: { slug, status: "PUBLISHED" }, include: { author: true } });
  return audit ? { kind, title: audit.title, slug: audit.slug, route: `/audits/${audit.slug}`, description: audit.summary ?? audit.seoDescription ?? "", contentHtml: audit.contentHtml ?? "", ogImage: audit.ogImage, updatedAt: audit.updatedAt, authorName: audit.author?.name } : undefined;
}
