import type { MetadataRoute } from "next";
import { legacyRecords } from "@/lib/content";
import { getPrisma } from "@/lib/prisma";
import { getCanonicalSiteUrl } from "@/lib/site-url";

const site = getCanonicalSiteUrl();
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [...legacyRecords.filter((record) => record.kind === "page" && record.slug !== "search").map((record) => ({ url: new URL(record.route, site).toString(), lastModified: new Date(record.migratedAt) })), { url: new URL("/sources", site).toString(), lastModified: new Date("2026-08-24T00:00:00.000Z") }, { url: new URL("/markets", site).toString(), lastModified: new Date("2026-08-24T00:00:00.000Z") }, { url: new URL("/macro", site).toString(), lastModified: new Date("2026-08-24T00:00:00.000Z") }];
  const db = getPrisma();
  if (!db) return [...staticPages, ...legacyRecords.filter((record) => record.kind === "article" || record.kind === "audit").map((record) => ({ url: new URL(record.route, site).toString(), lastModified: new Date(record.migratedAt) }))];
  const [articles, audits] = await Promise.all([db.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }), db.audit.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } })]);
  return [...staticPages, ...articles.map((article) => ({ url: new URL(`/articles/${article.slug}`, site).toString(), lastModified: article.updatedAt })), ...audits.map((audit) => ({ url: new URL(`/audits/${audit.slug}`, site).toString(), lastModified: audit.updatedAt }))];
}
