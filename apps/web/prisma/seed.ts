import "dotenv/config";
import bcrypt from "bcryptjs";
import legacyContent from "../src/content/legacy-content.json";
import { legacyPropFirms } from "../src/lib/prop-firms";
import { getPrisma } from "../src/lib/prisma";
import { sanitizeRichHtml } from "../src/lib/sanitize";

const resolvedDb = getPrisma();
if (!resolvedDb) throw new Error("DATABASE_URL is required before seeding.");
const db = resolvedDb;
const plainText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
async function main() {
  const category = await db.category.upsert({ where: { slug: "legacy-research" }, update: {}, create: { name: "Legacy Research", slug: "legacy-research", description: "Content migrated from the prior ForexMax static site." } });
  for (const record of legacyContent.filter((record) => record.kind === "article" || record.kind === "audit")) {
    const source = await db.researchSource.upsert({ where: { url: record.legacyUrl }, update: {}, create: { name: "ForexMax legacy page", url: record.legacyUrl, sourceType: "LEGACY_IMPORT", note: `Imported from ${record.sourceFile}; original body preserved.` } });
    const base = { title: record.title, contentMarkdown: plainText(record.contentHtml), contentHtml: sanitizeRichHtml(record.contentHtml), status: "PUBLISHED" as const, publishedAt: null, legacyUrl: record.legacyUrl, seoDescription: record.description || null, canonical: record.canonical || null, ogImage: record.ogImage || null };
    if (record.kind === "article") await db.article.upsert({ where: { slug: record.slug }, update: base, create: { ...base, slug: record.slug, categoryId: category.id, sources: { create: { sourceId: source.id } } } });
    else await db.audit.upsert({ where: { slug: record.slug }, update: base, create: { ...base, slug: record.slug, entity: record.title, auditType: "RESEARCH", sources: { create: { sourceId: source.id } } } });
  }
  for (const firm of legacyPropFirms) await db.propFirm.upsert({ where: { slug: firm.slug }, update: {}, create: { name: firm.name, slug: firm.slug, challengeFee: firm.challengeFee, profitSplit: firm.profitSplit, dailyDrawdown: firm.dailyDrawdown, maximumDrawdown: firm.maximumDrawdown, payout: firm.payout, newsTrading: firm.newsTrading, weekendHolding: firm.weekendHolding, expertAdvisor: firm.expertAdvisor, consistency: firm.consistency, scaling: firm.scaling, platform: firm.platform, evaluationType: firm.evaluationType, assessment: firm.assessment, status: "EVIDENCE_PENDING" } });
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL; const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (email && password) await db.user.upsert({ where: { email }, update: { role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) }, create: { email, name: "ForexMax Administrator", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) } });
  console.log(JSON.stringify({ importedArticles: legacyContent.filter((record) => record.kind === "article").length, importedAudits: legacyContent.filter((record) => record.kind === "audit").length, importedFirms: legacyPropFirms.length, bootstrapAdminCreated: Boolean(email && password) }));
}
main().finally(async () => { await db.$disconnect(); });
