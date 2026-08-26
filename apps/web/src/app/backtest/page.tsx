import { PageShell } from "@/components/page-shell";
import { BacktestWorkbench } from "@/components/backtest-workbench";
import { buildMetadata, jsonLd } from "@/lib/seo";

export const metadata = buildMetadata({ title: "AlphaBacktest Lab", description: "Run bounded historical simulations through the preserved AlphaBacktest Python engine with explicit Yahoo Finance provenance, assumptions and no-look-ahead controls.", path: "/backtest" });

export default function BacktestPage() {
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: "ForexMax AlphaBacktest Lab", applicationCategory: "FinanceApplication", operatingSystem: "Web", description: "A source-aware historical simulation tool that calls the preserved AlphaBacktest Python engine through bounded inputs." };
  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><BacktestWorkbench /></PageShell>;
}
