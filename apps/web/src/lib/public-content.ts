import { getLegacyArticles, getLegacyAudits, getLegacyRecord, type LegacyKind, type LegacyRecord } from "@/lib/content";
import { getPrisma } from "@/lib/prisma";
import { normalizePublicTitle } from "@/lib/seo";

export type PublicContent = {
  kind: "article" | "audit";
  title: string;
  slug: string;
  route: string;
  description: string;
  contentHtml: string;
  ogImage?: string | null;
  publishedAt?: Date | null;
  lastReviewedAt?: Date | null;
  updatedAt: Date;
  authorName?: string | null;
};
export type PublicPage = { title: string; slug: string; route: string; description: string; contentHtml: string; ogImage?: string | null; updatedAt: Date };
const readDate = (value?: string | null) => value ? new Date(`${value.slice(0, 10)}T00:00:00.000Z`) : null;
const asLegacy = (kind: "article" | "audit") => (record: LegacyRecord): PublicContent => ({
  kind, title: normalizePublicTitle(record.title), slug: record.slug, route: record.route, description: record.description,
  contentHtml: record.contentHtml, ogImage: record.ogImage, publishedAt: readDate(record.publishedAt),
  lastReviewedAt: readDate(record.lastReviewedAt), updatedAt: new Date(record.migratedAt),
});

// Narrow, temporary overrides keep specifically reviewed copies ahead of stale CMS text without DB writes.
// Remove each slug only after its published CMS row has been updated to the same verified copy.
const editorialOverrideSlugs = {
  article: new Set([
    "post-cftc-prop-firm-era",
    "vwap-sd-bands-institutional-secrets",
    "us-market-opening-range-strategy",
    "trading_sessions",
    "earn2trade-mobile-futures-killer-app",
    "earn2trade-mobile-futures-migration",
  ]),
  audit: new Set(["earn2trade-gauntlet-mini"]),
};
function getEditorialOverride(kind: "article" | "audit", slug: string): PublicContent | undefined {
  if (!editorialOverrideSlugs[kind].has(slug)) return undefined;
  const record = getLegacyRecord(kind, slug);
  return record ? asLegacy(kind)(record) : undefined;
}

export async function getPublishedArticles(): Promise<PublicContent[]> {
  const db = getPrisma();
  if (!db) return getLegacyArticles().map(asLegacy("article"));
  const articles = await db.article.findMany({ where: { status: "PUBLISHED" }, include: { author: true }, orderBy: { publishedAt: "desc" } });
  return articles.map((article) => getEditorialOverride("article", article.slug) ?? ({
    kind: "article", title: normalizePublicTitle(article.title), slug: article.slug, route: `/articles/${article.slug}`,
    description: article.excerpt ?? article.seoDescription ?? "", contentHtml: article.contentHtml ?? "",
    ogImage: article.ogImage, publishedAt: article.publishedAt, lastReviewedAt: article.lastReviewedAt,
    updatedAt: article.updatedAt, authorName: article.author?.name,
  }));
}

export async function getPublishedAudits(): Promise<PublicContent[]> {
  const db = getPrisma();
  if (!db) return getLegacyAudits().map(asLegacy("audit"));
  const audits = await db.audit.findMany({ where: { status: "PUBLISHED" }, include: { author: true }, orderBy: { publishedAt: "desc" } });
  return audits.map((audit) => getEditorialOverride("audit", audit.slug) ?? ({
    kind: "audit", title: normalizePublicTitle(audit.title), slug: audit.slug, route: `/audits/${audit.slug}`,
    description: audit.summary ?? audit.seoDescription ?? "", contentHtml: audit.contentHtml ?? "",
    ogImage: audit.ogImage, publishedAt: audit.publishedAt, lastReviewedAt: audit.lastReviewedAt,
    updatedAt: audit.updatedAt, authorName: audit.author?.name,
  }));
}

export async function getPublishedContent(kind: "article" | "audit", slug: string): Promise<PublicContent | undefined> {
  const db = getPrisma();
  if (!db) {
    const legacy = getLegacyRecord(kind as LegacyKind, slug);
    return legacy ? asLegacy(kind)(legacy) : undefined;
  }
  if (kind === "article") {
    const article = await db.article.findFirst({ where: { slug, status: "PUBLISHED" }, include: { author: true } });
    if (!article) return undefined;
    return getEditorialOverride(kind, slug) ?? {
      kind, title: normalizePublicTitle(article.title), slug: article.slug, route: `/articles/${article.slug}`,
      description: article.excerpt ?? article.seoDescription ?? "", contentHtml: article.contentHtml ?? "",
      ogImage: article.ogImage, publishedAt: article.publishedAt, lastReviewedAt: article.lastReviewedAt,
      updatedAt: article.updatedAt, authorName: article.author?.name,
    };
  }
  const audit = await db.audit.findFirst({ where: { slug, status: "PUBLISHED" }, include: { author: true } });
  if (!audit) return undefined;
  return getEditorialOverride(kind, slug) ?? {
    kind, title: normalizePublicTitle(audit.title), slug: audit.slug, route: `/audits/${audit.slug}`,
    description: audit.summary ?? audit.seoDescription ?? "", contentHtml: audit.contentHtml ?? "",
    ogImage: audit.ogImage, publishedAt: audit.publishedAt, lastReviewedAt: audit.lastReviewedAt,
    updatedAt: audit.updatedAt, authorName: audit.author?.name,
  };
}

export async function getPublishedPage(slug: string): Promise<PublicPage | undefined> {
  const db = getPrisma();
  if (!db) {
    const legacy = getLegacyRecord("page", slug);
    return legacy ? { title: normalizePublicTitle(legacy.title), slug: legacy.slug, route: legacy.route, description: legacy.description, contentHtml: legacy.contentHtml, ogImage: legacy.ogImage, updatedAt: new Date(legacy.migratedAt) } : undefined;
  }
  const page = await db.contentPage.findFirst({ where: { slug, status: "PUBLISHED" } });
  return page ? { title: normalizePublicTitle(page.title), slug: page.slug, route: `/${page.slug}`, description: page.excerpt ?? page.seoDescription ?? "", contentHtml: page.contentHtml ?? "", ogImage: page.ogImage, updatedAt: page.updatedAt } : undefined;
}
