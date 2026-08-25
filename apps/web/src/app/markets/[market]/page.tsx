import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getMarketDirectoryEntry, marketDirectory } from "@/lib/market-directory";
import { primarySources } from "@/lib/primary-sources";
import { presentDataQuality } from "@/lib/research-status";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { getCanonicalSiteUrl } from "@/lib/site-url";
import styles from "../markets.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return marketDirectory.map((market) => ({ market: market.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }) {
  const { market: slug } = await params;
  const market = getMarketDirectoryEntry(slug);
  if (!market) return buildMetadata({ title: "Market coverage unavailable", description: "The requested market coverage is unavailable.", path: "/markets", noIndex: true });
  return buildMetadata({ title: `${market.title} research coverage | ForexMax`, description: market.description, path: `/markets/${market.slug}` });
}

export default async function MarketDetailPage({ params }: { params: Promise<{ market: string }> }) {
  const { market: slug } = await params;
  const market = getMarketDirectoryEntry(slug);
  if (!market) notFound();
  const availability = presentDataQuality(market.availability);
  const sources = primarySources.filter((source) => market.sourceIds.includes(source.id));
  const siteUrl = getCanonicalSiteUrl();
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: `${market.title} research coverage`, url: `${siteUrl}/markets/${market.slug}`, description: market.description };

  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><div className={styles.page}>
    <header className={`shell ${styles.detailHeader}`}><Link className={styles.back} href="/markets">← Market coverage</Link><p className={styles.kicker}>{market.eyebrow} RESEARCH SURFACE</p><h1>{market.title}</h1><p>{market.description}</p></header>
    <section className={`shell ${styles.detailGrid}`}><div className={styles.availabilityPanel}><p className={styles.eyebrow}>CURRENT COVERAGE STATE</p><strong>{availability.label}</strong><p>{availability.note}</p></div><div className={styles.definitionPanel}><p className={styles.eyebrow}>COVERAGE STANDARD</p><p>{market.coverage}</p><p>{market.sourceFocus}</p></div></section>
    <section className={`shell ${styles.sourceSection}`}><div className={styles.sourceHeading}><div><p className={styles.kicker}>SOURCE INTELLIGENCE</p><h2>Named publishers before a claim.</h2></div><p>These are disclosure and data contracts relevant to this coverage. A listed publisher does not mean every dataset or live feed is active.</p></div>{sources.length ? <div className={styles.sourceTable}><div className={styles.sourceTableHead}><span>Publisher</span><span>Coverage</span><span>Access route</span></div>{sources.map((source) => <article key={source.id}><div><a href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a><small>{source.organization}</small></div><p>{source.coverage}</p><p>{source.accessMode.replaceAll("_", " ")}</p></article>)}</div> : <div className={styles.noSourceContract}><strong>Named source contract not activated.</strong><p>ForexMax will not substitute generic web content or an unnamed feed for an attributable publisher, symbol and methodology.</p></div>}</section>
    <section className={`shell ${styles.researchProtocol}`}><div><p className={styles.kicker}>PUBLICATION BOUNDARY</p><h2>Evidence is a record, not a label.</h2></div><div><p>{market.publicationBoundary}</p><ol><li>Capture the original publisher, URL and retrieval time.</li><li>Keep the release period, unit and methodology beside the fact.</li><li>Link evidence to the market event before drafting interpretation.</li><li>Require a human editorial decision before public publication.</li></ol>{market.deskRoute ? <Link href={market.deskRoute} className="button button-primary">Open live macro desk</Link> : <Link href="/sources" className="button button-quiet">Browse source directory</Link>}</div></section>
  </div></PageShell>;
}
