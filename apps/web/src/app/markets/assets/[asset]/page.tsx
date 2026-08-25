import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { assetIntelligenceProfiles, getAssetIntelligenceProfile } from "@/lib/asset-intelligence";
import { economicEventContracts } from "@/lib/economic-events";
import { getMacroSnapshot } from "@/lib/macro-data";
import { marketDriverFrameworks } from "@/lib/market-drivers";
import { getMarketTapeSnapshot } from "@/lib/market-tape";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { getCanonicalSiteUrl } from "@/lib/site-url";
import styles from "./asset-intelligence.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return assetIntelligenceProfiles.map((profile) => ({ asset: profile.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ asset: string }> }) {
  const { asset: slug } = await params;
  const profile = getAssetIntelligenceProfile(slug);
  if (!profile) return buildMetadata({ title: "Research context unavailable", description: "The requested research context is unavailable.", path: "/markets", noIndex: true });
  return buildMetadata({ title: `${profile.title} | ForexMax`, description: profile.description, path: `/markets/assets/${profile.slug}` });
}

export default async function AssetIntelligencePage({ params }: { params: Promise<{ asset: string }> }) {
  const { asset: slug } = await params;
  const profile = getAssetIntelligenceProfile(slug);
  if (!profile) notFound();
  const [tape, macro] = await Promise.all([getMarketTapeSnapshot(), getMacroSnapshot()]);
  const tapeItems = profile.tapeIds.map((id) => tape.items.find((item) => item.id === id)).filter(Boolean);
  const macroItems = profile.macroIds.map((id) => macro.observations.find((item) => item.id === id)).filter(Boolean);
  const drivers = profile.driverAsset ? marketDriverFrameworks.filter((driver) => driver.asset === profile.driverAsset) : [];
  const watchItems = economicEventContracts.filter((event) => profile.eventIds.includes(event.id));
  const siteUrl = getCanonicalSiteUrl();
  const schema = { "@context": "https://schema.org", "@type": "Report", name: profile.title, url: `${siteUrl}/markets/assets/${profile.slug}`, description: profile.description, dateModified: tape.retrievedAt, isBasedOn: tapeItems.map((item) => item?.sourceUrl).filter(Boolean) };

  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><main className={styles.page}>
    <header className={`shell ${styles.hero}`}><Link className={styles.back} href="/markets">← Market coverage</Link><p className={styles.kicker}>{profile.eyebrow} / SOURCE-AWARE DESK</p><h1>{profile.title}</h1><p>{profile.overview}</p><div className={styles.asOf}><span>RETRIEVED</span><strong>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(tape.retrievedAt))} UTC</strong></div></header>
    <section className={`shell ${styles.observations}`}><div className={styles.sectionHeading}><div><p className={styles.kicker}>MARKET OVERVIEW</p><h2>Published observations on record.</h2></div><p>Each row compares the latest two valid published values for its named source series. The change is a calculation, not an explanation.</p></div><div className={styles.observationTable}><div className={styles.tableHead}><span>Series</span><span>Latest</span><span>Change</span><span>Observation date</span><span>Source</span></div>{tapeItems.map((item) => item ? <article key={item.id}><div><strong>{item.label}</strong><small>{item.note}</small></div><b>{item.valueLabel}</b><span>{item.changeLabel}</span><time dateTime={item.latest.date}>{item.latest.date}</time><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName} ↗</a></article> : null)}</div></section>
    <section className={`shell ${styles.contextGrid}`}><article><p className={styles.kicker}>MACRO CONTEXT</p><h2>Official releases beside the tape.</h2><div className={styles.macroRows}>{macroItems.map((item) => item ? <div key={item.id}><span>{item.label}</span><strong>{item.valueLabel}</strong><small>{item.referencePeriod} · <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName} ↗</a></small></div> : null)}</div></article><article><p className={styles.kicker}>WHAT TO MONITOR</p><h2>Named official event sources.</h2><div className={styles.watchRows}>{watchItems.map((event) => <a key={event.id} href={event.sourceUrl} target="_blank" rel="noreferrer"><strong>{event.event} ↗</strong><span>{event.institution}</span><small>Event details are not populated until source fields are retrieved and verified.</small></a>)}</div></article></section>
    <section className={`shell ${styles.drivers}`}><div className={styles.sectionHeading}><div><p className={styles.kicker}>DRIVER EVIDENCE</p><h2>What would support a research assessment?</h2></div><p>Drivers are not bullish/bearish labels. They become eligible research inputs only when the named evidence is preserved, dated and reviewed.</p></div>{drivers.length ? <div className={styles.driverRows}>{drivers.map((driver) => <article key={driver.driver}><span>{driver.driver}</span><strong>{driver.sourceContracts.join(" · ")}</strong><p>{driver.requiredEvidence}</p></article>)}</div> : <p className={styles.driverNotice}>A dedicated driver framework is not yet approved for this asset. The visible observations remain factual context only.</p>}</section>
    <section className={`shell ${styles.boundary}`}><p className={styles.kicker}>PUBLICATION BOUNDARY</p><h2>What this page does not claim.</h2><p>{profile.limitations}</p><div><Link href="/methodology" className="button button-quiet">Research methodology</Link><Link href="/sources" className="button button-primary">Source registry</Link></div></section>
  </main></PageShell>;
}
