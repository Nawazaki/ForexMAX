import { PageShell } from "@/components/page-shell";
import { primarySources } from "@/lib/primary-sources";
import { buildMetadata, jsonLd } from "@/lib/seo";
import styles from "./sources.module.css";

export const metadata = buildMetadata({
  title: "Primary Research Sources | ForexMax",
  description: "A transparent directory of official primary sources used as starting points for ForexMax research.",
  path: "/sources",
});

export default function SourcesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ForexMax Primary Research Sources",
    url: "https://forexmax.com/sources",
    description: "Official primary sources used as starting points for ForexMax research.",
  };

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <section className="page-intro shell">
        <p className="eyebrow">SOURCE DIRECTORY</p>
        <h1>Start with the original record.</h1>
        <p>ForexMax prioritises official releases and source data. Inclusion here identifies a research starting point, not a claim that every source has been used for every publication.</p>
      </section>
      <section className={`shell section ${styles.directory}`} aria-label="Primary research sources">
        {primarySources.map((source) => (
          <article className={styles.card} key={source.id}>
            <p className="eyebrow">{source.jurisdiction}</p>
            <h2>{source.name}</h2>
            <p className={styles.organization}>{source.organization}</p>
            <dl>
              <div><dt>Coverage</dt><dd>{source.coverage}</dd></div>
              <div><dt>Access</dt><dd>{source.access}</dd></div>
            </dl>
            <a className="text-link" href={source.url} rel="noopener noreferrer" target="_blank">Open official source ↗</a>
          </article>
        ))}
      </section>
      <section className="shell research-notice">
        <strong>Verification policy:</strong> research records should retain the original source URL, publication date, evidence, and verification status. Missing or unavailable data is marked as such; it is never inferred as a fact.
      </section>
    </PageShell>
  );
}
