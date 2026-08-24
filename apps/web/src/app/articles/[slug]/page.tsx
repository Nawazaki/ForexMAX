import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/article-body";
import { PageShell } from "@/components/page-shell";
import { getLegacyArticles } from "@/lib/content";
import { getPublishedContent } from "@/lib/public-content";
import { buildMetadata, jsonLd } from "@/lib/seo";

export function generateStaticParams() { return getLegacyArticles().map((record) => ({ slug: record.slug })); }
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const record = await getPublishedContent("article", slug); return record ? buildMetadata({ title: record.title, description: record.description, path: record.route, image: record.ogImage }) : {}; }

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const record = await getPublishedContent("article", slug); if (!record) notFound();
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: record.title, description: record.description, mainEntityOfPage: `https://forexmax.com${record.route}` };
  return <PageShell><article className="shell article"><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><p className="eyebrow">FOREXMAX RESEARCH</p><h1>{record.title}</h1><p className="article-deck">{record.description}</p><ArticleBody html={record.contentHtml} /></article></PageShell>;
}
