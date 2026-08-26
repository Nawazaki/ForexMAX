import { PageShell } from "@/components/page-shell";
import { BacktestWorkbench } from "@/components/backtest-workbench";
import { buildMetadata, jsonLd } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Backtest Lab", description: "Run bounded historical reference-series simulations with source provenance, declared assumptions and no-look-ahead controls.", path: "/backtest" });

export default function BacktestPage() {
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: "ForexMax Backtest Lab", applicationCategory: "FinanceApplication", operatingSystem: "Web", description: "A source-aware historical simulation tool for approved datasets and strategies." };
  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><BacktestWorkbench /></PageShell>;
}
