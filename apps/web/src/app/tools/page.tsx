import { PageShell } from "@/components/page-shell";
import { TradingTools } from "@/components/trading-tools";
import { buildMetadata, jsonLd } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Trading Tools", description: "Position sizing, risk/reward and session-planning tools built for research and education.", path: "/tools" });
export default function ToolsPage() { const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: "ForexMax Trading Tools", applicationCategory: "FinanceApplication", operatingSystem: "Web", description: "Educational calculators for position size and risk/reward." }; return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><section className="shell page-intro"><p className="eyebrow">TOOLS</p><h1>Plan risk before acting.</h1><p>These calculators are educational utilities. Values are illustrative and do not account for spreads, commissions, slippage or provider-specific rules.</p></section><section className="shell section"><TradingTools /></section></PageShell>; }
