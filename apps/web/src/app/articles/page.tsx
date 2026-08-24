import { ContentCard } from "@/components/content-card";
import { PageShell } from "@/components/page-shell";
import { getPublishedArticles } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Market Research", description: "ForexMax market research and educational analysis.", path: "/articles" });
export const dynamic = "force-dynamic";

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  return <PageShell><section className="shell page-intro"><p className="eyebrow">RESEARCH ARCHIVE</p><h1>Market analysis and educational research.</h1><p>Published entries are served from the CMS after PostgreSQL is configured; the inherited archive remains visible during the controlled migration period.</p></section><section className="shell section"><div className="card-grid">{articles.map((record) => <ContentCard key={record.slug} record={record} />)}</div></section></PageShell>;
}
