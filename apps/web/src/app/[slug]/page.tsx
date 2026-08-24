import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { PageShell } from "@/components/page-shell";
import { getLegacyPage, legacyRecords } from "@/lib/content";
import { buildMetadata, jsonLd } from "@/lib/seo";

const reserved = new Set(["admin", "api", "articles", "audits", "search", "tools", "prop-firm-comparison"]);
export function generateStaticParams() { return legacyRecords.filter((record) => record.kind === "page" && record.slug !== "home" && !reserved.has(record.slug)).map((record) => ({ slug: record.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const record = getLegacyPage(slug); return record ? buildMetadata({ title: record.title, description: record.description, path: record.route, image: record.ogImage }) : {}; }
export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (reserved.has(slug)) notFound(); const record = getLegacyPage(slug); if (!record) notFound(); const schema = { "@context": "https://schema.org", "@type": "WebPage", name: record.title, description: record.description, url: `https://forexmax.com${record.route}` }; return <PageShell><article className="shell article static-page"><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><p className="eyebrow">FOREXMAX RESEARCH</p><h1>{record.title}</h1><p className="article-deck">{record.description}</p><ArticleBody html={record.contentHtml} /></article></PageShell>; }
