import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getSearchPlan, searchQuerySchema } from "@/lib/search-params";

export async function GET(request: Request) {
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Enter 2–100 characters for search." }, { status: 400 });
  const db = getPrisma();
  if (!db) return NextResponse.json({ error: "Search is awaiting PostgreSQL configuration." }, { status: 503 });

  const { q, category, page } = parsed.data;
  const { type, skip, outputLimit } = getSearchPlan(parsed.data);
  const whereText = { contains: q, mode: "insensitive" as const };
  const articleWhere = {
    status: "PUBLISHED" as const,
    ...(category ? { category: { slug: category } } : {}),
    OR: [{ title: whereText }, { excerpt: whereText }, { seoDescription: whereText }],
  };
  const auditWhere = {
    status: "PUBLISHED" as const,
    OR: [{ title: whereText }, { entity: whereText }, { summary: whereText }],
  };
  const propFirmWhere = {
    OR: [{ name: whereText }, { platform: whereText }, { evaluationType: whereText }],
  };

  const [articleCount, auditCount, propFirmCount] = await Promise.all([
    type === "all" || type === "article" ? db.article.count({ where: articleWhere }) : 0,
    type === "all" || type === "audit" ? db.audit.count({ where: auditWhere }) : 0,
    type === "all" || type === "prop-firm" ? db.propFirm.count({ where: propFirmWhere }) : 0,
  ]);
  const counts = [articleCount, auditCount, propFirmCount];
  let cursor = 0;
  const slices = counts.map((count) => {
    const start = Math.max(skip, cursor);
    const end = Math.min(skip + outputLimit, cursor + count);
    const slice = { skip: Math.max(0, start - cursor), take: Math.max(0, end - start) };
    cursor += count;
    return slice;
  });

  const [articles, audits, propFirms] = await Promise.all([
    slices[0].take > 0
      ? db.article.findMany({ where: articleWhere, select: { title: true, slug: true, excerpt: true }, orderBy: [{ publishedAt: "desc" }, { slug: "asc" }], take: slices[0].take, skip: slices[0].skip })
      : [],
    slices[1].take > 0
      ? db.audit.findMany({ where: auditWhere, select: { title: true, slug: true, summary: true }, orderBy: [{ publishedAt: "desc" }, { slug: "asc" }], take: slices[1].take, skip: slices[1].skip })
      : [],
    slices[2].take > 0
      ? db.propFirm.findMany({ where: propFirmWhere, select: { name: true, slug: true, assessment: true }, orderBy: [{ name: "asc" }, { slug: "asc" }], take: slices[2].take, skip: slices[2].skip })
      : [],
  ]);

  const flattened = [
    ...articles.map((item) => ({ type: "article", title: item.title, href: `/articles/${item.slug}`, description: item.excerpt ?? "" })),
    ...audits.map((item) => ({ type: "audit", title: item.title, href: `/audits/${item.slug}`, description: item.summary ?? "" })),
    ...propFirms.map((item) => ({ type: "prop-firm", title: item.name, href: "/prop-firm-comparison", description: item.assessment ?? "Evidence status not recorded." })),
  ];
  const total = counts.reduce((sum, count) => sum + count, 0);

  return NextResponse.json({ page, limit: outputLimit, hasMore: total > skip + outputLimit, results: flattened });
}
