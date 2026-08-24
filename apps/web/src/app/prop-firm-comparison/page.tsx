import { PageShell } from "@/components/page-shell";
import { PropComparison } from "@/components/prop-comparison";
import { legacyPropFirms } from "@/lib/prop-firms";
import { buildMetadata, jsonLd } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Prop Firm & Broker Research", description: "Independent research and comparison of third-party proprietary trading firms and retail brokers.", path: "/prop-firm-comparison" });
export default function PropFirmComparisonPage() { const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "ForexMax Prop Firm & Broker Research", url: "https://forexmax.com/prop-firm-comparison" }; return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><section className="shell page-intro"><p className="eyebrow">COMPARISON RESEARCH</p><h1>Compare terms. Verify current evidence.</h1><p>Fields are migrated from the current static comparison. Each record is labelled with its review status; no score is published where evidence is pending.</p></section><section className="shell section"><PropComparison firms={legacyPropFirms} /></section></PageShell>; }
