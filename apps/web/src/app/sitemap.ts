import type { MetadataRoute } from "next";
import { assetIntelligenceProfiles } from "@/lib/asset-intelligence";
import { legacyRecords } from "@/lib/content";
import { marketDirectory } from "@/lib/market-directory";
import { getPrisma } from "@/lib/prisma";
import { getCanonicalSiteUrl } from "@/lib/site-url";

const site = getCanonicalSiteUrl();
const unique = (entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap => [...new Map(entries.map((entry) => [entry.url, entry])).values()];
const legacyEntry = (record: (typeof legacyRecords)[number]): MetadataRoute.Sitemap[number] => {
  const date = record.lastReviewedAt ?? record.publishedAt;
  return {
    url: new URL(record.route, site).toString(),
    ...(date ? { lastModified: new Date(`${date.slice(0, 10)}T00:00:00.000Z`) } : {}),
  };
};
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketPages = marketDirectory.map((market) => ({ url: new URL(`/markets/${market.slug}`, site).toString(), lastModified: new Date("2026-08-25T00:00:00.000Z") }));
  const assetPages = assetIntelligenceProfiles.map((asset) => ({ url: new URL(`/markets/assets/${asset.slug}`, site).toString(), lastModified: new Date("2026-08-25T00:00:00.000Z") }));
  const staticPages = [...legacyRecords.filter((record) => record.kind === "page" && record.slug !== "search").map(legacyEntry), { url: new URL("/sources", site).toString(), lastModified: new Date("2026-08-25T00:00:00.000Z") }, { url: new URL("/markets", site).toString(), lastModified: new Date("2026-08-25T00:00:00.000Z") }, ...marketPages, ...assetPages, { url: new URL("/macro", site).toString(), lastModified: new Date("2026-08-25T00:00:00.000Z") }, { url: new URL("/research", site).toString(), lastModified: new Date("2026-08-25T00:00:00.000Z") }];
  const db = getPrisma();
  if (!db) return unique([...staticPages, ...legacyRecords.filter((record) => record.kind === "article" || record.kind === "audit").map(legacyEntry)]);
  const [articles, audits] = await Promise.all([db.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }), db.audit.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } })]);
  return unique([...staticPages, ...articles.map((article) => ({ url: new URL(`/articles/${article.slug}`, site).toString(), lastModified: article.updatedAt })), ...audits.map((audit) => ({ url: new URL(`/audits/${audit.slug}`, site).toString(), lastModified: audit.updatedAt }))]);
}
