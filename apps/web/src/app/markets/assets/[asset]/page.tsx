import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { assetIntelligenceProfiles, getAssetIntelligenceProfile } from "@/lib/asset-intelligence";
import { getCrossAssetSnapshot } from "@/lib/cross-asset-intelligence";
import { economicEventContracts } from "@/lib/economic-events";
import { driverCategoryLabels, marketDriverFrameworks } from "@/lib/market-drivers";
import { observationFreshnessLabel, observationStatusLabel } from "@/lib/market-observation";
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

const displayTime = (value: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));
const numeric = (value: number, precision: number) => value.toFixed(precision);

export default async function AssetIntelligencePage({ params }: { params: Promise<{ asset: string }> }) {
  const { asset: slug } = await params;
  const profile = getAssetIntelligenceProfile(slug);
  if (!profile) notFound();

  const crossAsset = await getCrossAssetSnapshot();
  const tapeItems = profile.tapeIds.map((id) => crossAsset.tape.find((item) => item.id === id)).filter(Boolean);
  const macroItems = profile.macroIds.map((id) => crossAsset.macro.find((item) => item.id === id)).filter(Boolean);
  const allObservations = [...crossAsset.tape, ...crossAsset.macro];
  const drivers = profile.driverAsset ? marketDriverFrameworks.filter((driver) => driver.asset === profile.driverAsset) : [];
  const watchItems = economicEventContracts.filter((event) => profile.eventIds.includes(event.id));
  const siteUrl = getCanonicalSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Report",
    name: profile.title,
    url: `${siteUrl}/markets/assets/${profile.slug}`,
    description: profile.description,
    dateModified: crossAsset.retrievedAt,
    isBasedOn: allObservations.filter((item) => profile.tapeIds.includes(item.id) || (profile.macroIds as string[]).includes(item.id)).map((item) => item.sourceUrl),
  };

  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><main className={styles.page}>
    <header className={`shell ${styles.hero}`}>
      <Link className={styles.back} href="/markets">← Market coverage</Link>
      <p className={styles.kicker}>{profile.eyebrow} / SOURCE-AWARE DESK</p>
      <h1>{profile.title}</h1>
      <p>{profile.overview}</p>
      <div className={styles.asOf}><span>RETRIEVED FROM NAMED SOURCES</span><strong>{displayTime(crossAsset.retrievedAt)} UTC</strong><small>Values are dated official observations, not live or intraday quotes.</small></div>
    </header>

    <section className={`shell ${styles.observations}`}>
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>LATEST OBSERVATIONS</p><h2>What changed on the source record.</h2></div><p>Each row retains the latest and prior valid observations, reversible change, reference date, source, retrieval timestamp, freshness and status. A historical comparison appears only when the bounded source window supplies an earlier valid record.</p></div>
      <div className={styles.observationTable}>
        <div className={styles.tableHead}><span>Series / historical context</span><span>Latest official observation</span><span>Previous valid observation</span><span>Change</span><span>Reference date</span><span>Data quality</span><span>Source</span></div>
        {tapeItems.map((item) => item ? <article key={item.id}>
          <div><strong>{item.label}</strong><small>{item.note}</small>{item.historical ? <small>Earlier valid record: {item.historical.date} · {numeric(item.historical.value, item.unit === "FX" ? 4 : 2)} · change to latest {item.historicalChangeLabel}</small> : <small>No earlier valid record in this bounded source retrieval.</small>}</div>
          <b>{item.valueLabel}</b>
          <span>{numeric(item.previous.value, item.unit === "FX" ? 4 : 2)} <small>· {item.previous.date}</small></span>
          <span>{item.changeLabel}{item.changePercent !== null ? ` · ${item.changePercent > 0 ? "+" : ""}${item.changePercent.toFixed(2)}%` : ""}</span>
          <time dateTime={item.referencePeriod}>{item.referencePeriod}</time>
          <div className={styles.quality}><small>{observationFreshnessLabel(item.freshness)}</small><small>{observationStatusLabel(item.status)}</small><small>Retrieved {displayTime(item.retrievedAt)} UTC</small></div>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName} ↗</a>
        </article> : null)}
      </div>
    </section>

    <section className={`shell ${styles.contextGrid}`}>
      <article>
        <p className={styles.kicker}>MACRO RECORD</p><h2>Official context beside the asset.</h2>
        <div className={styles.macroRows}>{macroItems.map((item) => item ? <div key={item.id}><span>{item.label}</span><strong>{item.compactValueLabel ?? item.valueLabel}</strong><small>Reference {item.referencePeriod}{item.previousValue !== null && item.change !== null ? ` · previous ${item.previousValue.toFixed(item.id === "us-cpi" ? 3 : 2)} · Δ ${item.change > 0 ? "+" : ""}${item.change.toFixed(item.id === "us-cpi" ? 3 : 2)}` : ""}</small><small>{observationFreshnessLabel(item.freshness)} · retrieved {displayTime(item.retrievedAt)} UTC</small><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName} ↗</a></div> : null)}</div>
      </article>
      <article>
        <p className={styles.kicker}>UPCOMING CATALYSTS</p><h2>Official event sources, not invented schedules.</h2>
        <div className={styles.watchRows}>{watchItems.map((event) => <a key={event.id} href={event.sourceUrl} target="_blank" rel="noreferrer"><strong>{event.event} ↗</strong><span>{event.institution}</span><small>{event.releaseTime ? `Verified release time: ${event.releaseTime}` : "No verified upcoming timestamp, forecast, actual or surprise has been retrieved for this desk."}</small></a>)}</div>
      </article>
    </section>

    <section className={`shell ${styles.drivers}`}>
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>EVIDENCE-LED DRIVER MODEL</p><h2>Observed factors before directional labels.</h2></div><p>A factor is rendered only with linked source observations or as an explicit source gap. ForexMax does not publish bullish or bearish labels when it lacks an asset-specific, dated evidence chain and editorial review.</p></div>
      <div className={styles.assessmentBoundary}><article><span>BULLISH FACTORS</span><strong>None published</strong><p>No evidence-backed directional classification is available in the current source set.</p></article><article><span>BEARISH FACTORS</span><strong>None published</strong><p>No evidence-backed directional classification is available in the current source set.</p></article><article><span>RESEARCH BOUNDARY</span><strong>Observed context only</strong><p>Visible changes are calculations from named source records, not causal conclusions.</p></article></div>
      {drivers.length ? <div className={styles.driverRows}>{drivers.map((driver) => {
        const evidence = driver.observationIds.map((id) => allObservations.find((observation) => observation.id === id)).filter(Boolean);
        return <article key={`${driver.asset}-${driver.driver}`}><div><span>{driverCategoryLabels[driver.category]}</span><strong>{driver.driver}</strong></div><div><b>{evidence.length ? "Linked observations" : "Explicit evidence gap"}</b>{evidence.length ? evidence.map((observation) => observation ? <a key={observation.id} href={observation.sourceUrl} target="_blank" rel="noreferrer">{observation.metric} · {observation.referencePeriod} ↗</a> : null) : <small>{driver.sourceContracts.join(" · ")}</small>}</div><p>{driver.requiredEvidence}</p></article>;
      })}</div> : <p className={styles.driverNotice}>No driver framework is approved for this asset. The visible observations remain factual context only.</p>}
    </section>

    <section className={`shell ${styles.researchBoundary}`}>
      <div><p className={styles.kicker}>RELATED RESEARCH</p><h2>Archive and publication status.</h2></div><p>No asset-tagged, reviewer-approved research record is currently linked to this page. The desk keeps the public observation layer separate from future editorial conclusions.</p><Link href="/research" className="text-link">Open the research archive →</Link>
    </section>

    <section className={`shell ${styles.boundary}`}><p className={styles.kicker}>RISKS AND PUBLICATION BOUNDARY</p><h2>What this page does not claim.</h2><p>{profile.limitations}</p><div><Link href="/methodology" className="button button-quiet">Research methodology</Link><Link href="/sources" className="button button-primary">Source registry</Link></div></section>
  </main></PageShell>;
}
