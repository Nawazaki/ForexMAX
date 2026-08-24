import Link from "next/link";
import { ContentCard } from "@/components/content-card";
import { PageShell } from "@/components/page-shell";
import { getPublishedArticles, getPublishedAudits } from "@/lib/public-content";
import { buildMetadata, jsonLd } from "@/lib/seo";

export const metadata = buildMetadata({ title: "ForexMax — Financial Research & Trading Intelligence", description: "Independent financial research, trading intelligence and educational analysis covering markets, brokers and proprietary trading firms.", path: "/" });
export const dynamic = "force-dynamic";

export default async function Home() {
  const [audits, articles] = await Promise.all([getPublishedAudits(), getPublishedArticles()]);
  const cards = [...audits, ...articles.slice(0, 3)];
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "Organization", name: "ForexMax Research", url: "https://forexmax.com", description: "Independent financial research and educational analysis." }, { "@type": "WebSite", name: "ForexMax", url: "https://forexmax.com" }] };
  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><section className="hero"><div className="shell hero-grid"><div><p className="eyebrow">FOREXMAX RESEARCH DESK</p><h1>Financial research built for <em>clearer decisions.</em></h1><p className="hero-copy">Independent market analysis, technical audits, comparison research and trading education. Evidence-led, source-aware and never a substitute for professional advice.</p><div className="hero-actions"><Link className="button button-primary" href="/prop-firm-comparison">Explore comparisons</Link><Link className="button button-quiet" href="/methodology">Read methodology</Link></div></div><aside className="signal-panel"><p className="eyebrow">RESEARCH STATUS</p><strong>Transparent by design.</strong><ul><li>Source-led comparisons</li><li>Research assessments, not ratings</li><li>Tools for planning, not signals</li></ul></aside></div></section><section className="shell discovery"><div><p className="eyebrow">DISCOVER</p><h2>Research, compare, assess and calculate.</h2></div><div className="discovery-grid"><Link href="/articles">Market research <span>→</span></Link><Link href="/audits">Technical audits <span>→</span></Link><Link href="/risk-intelligence">Risk intelligence <span>→</span></Link><Link href="/tools">Trading tools <span>→</span></Link></div></section><section className="shell section"><div className="section-heading"><div><p className="eyebrow">FEATURED RESEARCH</p><h2>Start with a documented view.</h2></div><Link href="/articles" className="text-link">View all articles →</Link></div><div className="card-grid">{cards.map((record) => <ContentCard key={`${record.kind}-${record.slug}`} record={record} />)}</div></section></PageShell>;
}
