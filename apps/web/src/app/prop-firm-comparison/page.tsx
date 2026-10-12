import { PageShell } from "@/components/page-shell";
import { PropComparison } from "@/components/prop-comparison";
import { legacyPropFirms } from "@/lib/prop-firms";
import { buildMetadata, jsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Prop Firm Research & Verified Program Terms | ForexMax",
  description: "Date-stamped comparison of third-party simulated trading evaluation programs, with official sources, plan-specific conditions, and unresolved terms clearly labelled.",
  path: "/prop-firm-comparison",
});

export default function PropFirmComparisonPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ForexMax Proprietary Trading Program Research",
    url: "https://www.forexmax.com/prop-firm-comparison",
    dateModified: "2026-10-12",
    inLanguage: "en-US",
  };
  return <PageShell>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
    <section className="shell page-intro">
      <p className="eyebrow">COMPARISON RESEARCH</p>
      <h1>Compare documented terms—not marketing labels.</h1>
      <p>This is a dated desk review of official program documents, not an execution test, payout verification, recommendation, or regulatory rating. The providers and program types are not directly equivalent.</p>
      <p><strong>Official sources checked:</strong> <time dateTime="2026-10-12">October 12, 2026</time>.</p>
    </section>
    <section className="shell section"><PropComparison firms={legacyPropFirms} /></section>
  </PageShell>;
}
