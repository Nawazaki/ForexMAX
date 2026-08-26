import { PageShell } from "@/components/page-shell";
import { BacktestWorkbench } from "@/components/backtest-workbench";
import { buildMetadata, jsonLd } from "@/lib/seo";

export const metadata = buildMetadata({ title: "Quant Research Workspace", description: "Create a reviewable historical research plan, run a constrained daily Strategy DSL and inspect source-aware out-of-sample and robustness diagnostics. AlphaBacktest remains a separate fidelity reference.", path: "/backtest" });

export default function BacktestPage() {
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: "ForexMax Quant Research Workspace", applicationCategory: "FinanceApplication", operatingSystem: "Web", description: "A review-gated historical research workspace with a constrained Strategy DSL, source-aware data provenance and bounded robustness diagnostics. AlphaBacktest is retained as a separate fidelity reference." };
  return <PageShell><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><BacktestWorkbench /></PageShell>;
}
