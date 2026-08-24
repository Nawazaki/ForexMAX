import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getMarketDirectoryEntry, marketDirectory } from "@/lib/market-directory";
import { presentDataQuality } from "@/lib/research-status";
import { buildMetadata } from "@/lib/seo";
import styles from "../markets.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return marketDirectory.map((market) => ({ market: market.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ market: string }> }) {
  const { market: slug } = await params;
  const market = getMarketDirectoryEntry(slug);
  if (!market) return buildMetadata({ title: "Market coverage unavailable", description: "The requested market coverage is unavailable.", path: "/markets", noIndex: true });
  return buildMetadata({ title: `${market.title} coverage | ForexMax`, description: market.description, path: `/markets/${market.slug}`, noIndex: true });
}

export default async function MarketDetailPage({ params }: { params: Promise<{ market: string }> }) {
  const { market: slug } = await params;
  const market = getMarketDirectoryEntry(slug);
  if (!market) notFound();
  const availability = presentDataQuality(market.availability);
  return <PageShell><div className={styles.page}>
    <header className={`shell ${styles.detailHeader}`}><Link className={styles.back} href="/markets">← Market coverage</Link><p className={styles.kicker}>{market.eyebrow} RESEARCH SURFACE</p><h1>{market.title}</h1><p>{market.description}</p></header>
    <section className={`shell ${styles.detailGrid}`}><div className={styles.availabilityPanel}><p className={styles.eyebrow}>CURRENT AVAILABILITY</p><strong>{availability.label}</strong><p>{availability.note}</p></div><div className={styles.definitionPanel}><p className={styles.eyebrow}>COVERAGE STANDARD</p><p>{market.coverage}</p><p>{market.sourceFocus}</p></div></section>
    <section className={`shell ${styles.emptyState}`}><p className={styles.kicker}>NO MARKET CLAIMS DISPLAYED</p><h2>This page is reserved for verified research records.</h2><p>ForexMax will publish market context, evidence, drivers, risks and related research here only after the underlying data contract and editorial review trail exist. Until then, no price, probability, chart or directional view is inferred.</p><div><Link href="/sources" className="button button-primary">Review sources</Link><Link href="/methodology" className="button button-quiet">Read methodology</Link></div></section>
  </div></PageShell>;
}
