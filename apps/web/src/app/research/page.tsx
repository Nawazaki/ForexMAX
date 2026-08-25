import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getPublishedArticles, getPublishedAudits } from "@/lib/public-content";
import { buildMetadata, jsonLd } from "@/lib/seo";
import styles from "./research.module.css";

export const metadata = buildMetadata({
  title: "Research Desk | ForexMax",
  description: "Published ForexMax research alongside the evidence, source, and editorial controls that govern future market intelligence.",
  path: "/research",
});

export default async function ResearchDesk() {
  const [articles, audits] = await Promise.all([getPublishedArticles(), getPublishedAudits()]);
  const records = [...audits, ...articles].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 8);
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "ForexMax Research Desk", url: "https://www.forexmax.com/research", description: "Published research and the documented controls used for source-aware financial research." };

  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><div className={styles.page}>
    <section className={`shell ${styles.hero}`}><p className="eyebrow">RESEARCH DESK / PUBLISHED RECORDS</p><h1>Separate the record from the reaction.</h1><p>Published work is shown alongside the controls that govern future research. ForexMax does not turn a headline, a social signal, or an unverified observation into a market conclusion.</p><div><Link href="/sources" className="button button-primary">Source registry</Link><Link href="/methodology" className="button button-quiet">Research methodology</Link></div></section>
    <section className={`shell ${styles.protocol}`}><div><p className="eyebrow">RESEARCH STANDARD</p><h2>What a future assessment must carry.</h2></div><ol><li><span>01</span><strong>Original source</strong><p>Publisher URL, document date, retrieval time, and applicable methodology.</p></li><li><span>02</span><strong>Verified evidence</strong><p>Claim-level support must be reviewed before it can inform an assessment.</p></li><li><span>03</span><strong>Editorial decision</strong><p>Publication requires a documented human approval; no automated publishing path exists.</p></li></ol></section>
    <section className={`shell ${styles.feed}`}><div className={styles.feedHeading}><div><p className="eyebrow">RESEARCH FEED</p><h2>Published archive</h2></div><p>Legacy and current published material appears here. New market intelligence remains blocked until a Preview database can retain its evidence and review history.</p></div><div className={styles.feedList}>{records.map((record, index) => <article key={`${record.kind}-${record.slug}`}><span>{String(index + 1).padStart(2, "0")}</span><div><p>{record.kind} / updated {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(record.updatedAt)}</p><h3><Link href={record.route}>{record.title}</Link></h3><p>{record.description}</p></div></article>)}</div><div className={styles.archiveLinks}><Link href="/articles">Article archive →</Link><Link href="/audits">Audit archive →</Link><Link href="/macro">Official macro desk →</Link></div></section>
    <section className={`shell ${styles.boundary}`}><div><p className="eyebrow">PUBLICATION BOUNDARY</p><h2>Market Bias remains unavailable.</h2></div><p>ForexMax will not display a directional score, probability, or trade signal until timestamped inputs, a documented methodology, evidence records, and an editorial review exist. Missing data stays missing.</p></section>
  </div></PageShell>;
}
