import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSearchPlan, searchQuerySchema } from "@/lib/search-params";

export async function GET(request: Request) {
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Enter 2–100 characters for search." }, { status: 400 });
  const db = getPrisma(); if (!db) return NextResponse.json({ error: "Search is awaiting PostgreSQL configuration." }, { status: 503 });
  const { q, category, page } = parsed.data; const { type, skip, take, outputLimit } = getSearchPlan(parsed.data); const whereText = { contains: q, mode: "insensitive" as const };
  const results = await Promise.all([
    type === "all" || type === "article" ? db.article.findMany({ where: { status: "PUBLISHED", ...(category ? { category: { slug: category } } : {}), OR: [{ title: whereText }, { excerpt: whereText }, { seoDescription: whereText }] }, select: { title: true, slug: true, excerpt: true }, take, skip }) : [],
    type === "all" || type === "audit" ? db.audit.findMany({ where: { status: "PUBLISHED", OR: [{ title: whereText }, { entity: whereText }, { summary: whereText }] }, select: { title: true, slug: true, summary: true }, take, skip }) : [],
    type === "all" || type === "prop-firm" ? db.propFirm.findMany({ where: { OR: [{ name: whereText }, { platform: whereText }, { evaluationType: whereText }] }, select: { name: true, slug: true, assessment: true }, take, skip }) : [],
  ]);
  const flattened = [...results[0].map((item) => ({ type: "article", title: item.title, href: `/articles/${item.slug}`, description: item.excerpt ?? "" })), ...results[1].map((item) => ({ type: "audit", title: item.title, href: `/audits/${item.slug}`, description: item.summary ?? "" })), ...results[2].map((item) => ({ type: "prop-firm", title: item.name, href: "/prop-firm-comparison", description: item.assessment ?? "Evidence status not recorded." }))];
  return NextResponse.json({ page, limit: outputLimit, hasMore: flattened.length > outputLimit, results: flattened.slice(0, outputLimit) });
}
