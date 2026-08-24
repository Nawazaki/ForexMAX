import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { PageShell } from "@/components/page-shell";
import { getLegacyAudits } from "@/lib/content";
import { getPublishedContent } from "@/lib/public-content";
import { buildMetadata, jsonLd } from "@/lib/seo";

export function generateStaticParams() { return getLegacyAudits().map((record) => ({ slug: record.slug })); }
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const record = await getPublishedContent("audit", slug); return record ? buildMetadata({ title: record.title, description: record.description, path: record.route, image: record.ogImage }) : {}; }
export default async function AuditPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const record = await getPublishedContent("audit", slug); if (!record) notFound(); const schema = { "@context": "https://schema.org", "@type": "Article", headline: record.title, description: record.description, mainEntityOfPage: `https://forexmax.com${record.route}` }; return <PageShell><article className="shell article"><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><p className="eyebrow">TECHNICAL AUDIT</p><h1>{record.title}</h1><p className="article-deck">{record.description}</p><div className="research-notice">Research assessment only. It is not an official regulatory certification or a provider endorsement.</div><ArticleBody html={record.contentHtml} /></article></PageShell>; }
