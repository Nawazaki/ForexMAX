import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { marketDirectory } from "@/lib/market-directory";
import { presentDataQuality } from "@/lib/research-status";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { getCanonicalSiteUrl } from "@/lib/site-url";
import styles from "./markets.module.css";

export const metadata = buildMetadata({ title: "Markets coverage | ForexMax", description: "ForexMax market coverage directory with explicit source, review and data-availability states.", path: "/markets" });

export default function MarketsPage() {
  const siteUrl = getCanonicalSiteUrl();
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "ForexMax market coverage", url: `${siteUrl}/markets`, description: "A source-aware directory of ForexMax market research coverage." };
  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><div className={styles.page}>
    <header className="shell"><p className={styles.kicker}>MARKET COVERAGE DIRECTORY</p><div className={styles.intro}><h1>Coverage before commentary.</h1><p>ForexMax is establishing source-backed research coverage across markets. A listed area does not imply a price feed, market call or published assessment. Each route shows its current evidence and availability state.</p></div></header>
    <section className={`shell ${styles.matrix}`} aria-label="Market coverage status"><div className={styles.matrixHead}><span>Market</span><span>Coverage</span><span>Data status</span><span>Source standard</span></div>{marketDirectory.map((market) => { const availability = presentDataQuality(market.availability); return <article className={styles.marketRow} key={market.slug}><div><p className={styles.eyebrow}>{market.eyebrow}</p><h2><Link href={`/markets/${market.slug}`}>{market.title}</Link></h2></div><p>{market.coverage}</p><span className={styles.status}>{availability.label}</span><p>{market.sourceFocus}</p></article>; })}</section>
    <section className={`shell ${styles.protocol}`}><div><p className={styles.kicker}>PUBLICATION PROTOCOL</p><h2>What makes a market record usable?</h2></div><ol><li>Original source and retrieval time are retained.</li><li>Data quality and freshness are visible.</li><li>Interpretation stays separate from fact and data.</li><li>Human review precedes public research publication.</li></ol><Link href="/sources" className="text-link">Inspect official source directory →</Link></section>
  </div></PageShell>;
}
