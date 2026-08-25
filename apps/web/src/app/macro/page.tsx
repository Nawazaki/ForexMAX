import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getMacroSnapshot, sparklinePoints } from "@/lib/macro-data";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { getCanonicalSiteUrl } from "@/lib/site-url";
import styles from "./macro.module.css";

export const metadata = buildMetadata({ title: "Macro intelligence | ForexMax", description: "Official-source macro snapshot with latest BLS and FRED observations, reference periods, source links and retrieval time.", path: "/macro" });
export const revalidate = 900;

const displayTime = (value: string) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));

export default async function MacroPage() {
  const snapshot = await getMacroSnapshot();
  const site = getCanonicalSiteUrl();
  const schema = { "@context": "https://schema.org", "@type": "Dataset", name: "ForexMax official macro snapshot", url: `${site}/macro`, description: "A presentation layer for currently retrieved official BLS and FRED macro observations.", creator: { "@type": "Organization", name: "ForexMax Research" } };
  const yieldObservation = snapshot.observations.find((item) => item.id === "us-10y");
  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><div className={styles.page}>
    <header className={`shell ${styles.header}`}><p className={styles.kicker}>MACRO INTELLIGENCE / OFFICIAL-DATA SNAPSHOT</p><div><h1>Read the release before the reaction.</h1><p>Macro data is presented with its source, reference period and retrieval time. ForexMax does not automatically infer a trade, policy path or market reaction from these observations.</p></div><aside><span>RETRIEVED</span><strong>{displayTime(snapshot.retrievedAt)} UTC</strong><small>Refresh target: 15 minutes</small></aside></header>
    <section className={`shell ${styles.observations}`}><div className={styles.sectionHeading}><div><p className={styles.kicker}>LATEST OFFICIAL OBSERVATIONS</p><h2>Data on record.</h2></div><p>Values remain attributable to the publisher. Reference period and retrieval time are not interchangeable.</p></div>{snapshot.observations.length ? <div className={styles.tableWrap}><table><thead><tr><th>Series</th><th>Latest reading</th><th>Reference period</th><th>Source</th><th>Method note</th></tr></thead><tbody>{snapshot.observations.map((item) => <tr key={item.id}><th scope="row">{item.label}</th><td><strong>{item.valueLabel}</strong></td><td>{item.referencePeriod}</td><td><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName}</a></td><td>{item.note}</td></tr>)}</tbody></table></div> : <p className={styles.failure}>Official macro endpoints did not return a usable observation in this request. No substitute value is shown.</p>}</section>
    <section className={`shell ${styles.lowerGrid}`}><article className={styles.yieldPanel}><p className={styles.kicker}>RATES CONTEXT</p><h2>10-year Treasury observation</h2>{yieldObservation ? <><div className={styles.yieldValue}><strong>{yieldObservation.valueLabel}</strong><span>{yieldObservation.referencePeriod}</span></div><svg viewBox="0 0 260 70" role="img" aria-label="Recent official FRED DGS10 observations"><polyline points={sparklinePoints(snapshot.tenYearSeries)} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg><p>Recent published FRED observations only. This is not an intraday yield quote.</p></> : <p className={styles.failure}>The official rate series was not available for this request.</p>}</article>
      <article className={styles.protocol}><p className={styles.kicker}>EVIDENCE PROTOCOL</p><h2>What reaches the public desk?</h2><ol><li>Publisher and original URL are preserved.</li><li>Observation period remains visible beside the value.</li><li>Retrieval time is shown separately.</li><li>Analysis waits for documented evidence and editorial review.</li></ol><Link href="/sources" className="text-link">Inspect source directory →</Link></article></section>
    <section className={`shell ${styles.sources}`}><div><p className={styles.kicker}>SOURCE INTELLIGENCE</p><h2>Publisher-led, not headline-led.</h2></div><div><p>The initial desk reads official BLS and FRED observations directly. Treasury, BEA, central-bank and event sources are next contracts, not implied coverage.</p><Link href="/sources" className="button button-primary">View source registry</Link></div></section>
    {snapshot.failures.length ? <aside className={`shell ${styles.status}`}><strong>Source status</strong><span>{snapshot.failures.length} official input{snapshot.failures.length === 1 ? "" : "s"} could not be read in this request; unaffected observations remain shown with their own source labels.</span></aside> : null}
  </div></PageShell>;
}
