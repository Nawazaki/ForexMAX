import type { DataQualityState } from "@/lib/research-status";

export type MarketDirectoryEntry = {
  slug: "forex" | "commodities" | "indices" | "crypto" | "macro";
  title: string;
  eyebrow: string;
  description: string;
  coverage: string;
  availability: DataQualityState;
  sourceFocus: string;
};

export const marketDirectory: MarketDirectoryEntry[] = [
  {
    slug: "forex",
    title: "Foreign exchange",
    eyebrow: "FX",
    description: "Currency-market research should link macro releases, central-bank context and original source records before any interpretation is published.",
    coverage: "EUR/USD, GBP/USD and USD/JPY coverage is not yet connected to a verified live-price contract.",
    availability: "UNAVAILABLE",
    sourceFocus: "Central banks, official statistics and documented market-data contracts.",
  },
  {
    slug: "commodities",
    title: "Commodities",
    eyebrow: "COMMODITIES",
    description: "Gold, energy and related research will use source-backed drivers, event records and declared freshness before figures or charts are shown.",
    coverage: "No verified live gold or oil feed is currently connected to this research surface.",
    availability: "UNAVAILABLE",
    sourceFocus: "Official releases, energy agencies and documented market-data contracts.",
  },
  {
    slug: "indices",
    title: "Indices",
    eyebrow: "INDICES",
    description: "Index coverage requires a traceable market-data basis and clear separation between constituent facts, market data and editorial interpretation.",
    coverage: "No verified index snapshot or historical-series contract is currently connected.",
    availability: "UNAVAILABLE",
    sourceFocus: "Exchange data, index providers and source-backed research records.",
  },
  {
    slug: "crypto",
    title: "Digital assets",
    eyebrow: "CRYPTO",
    description: "Digital-asset pages will not imply a feed, price, liquidity measure or probability until their methodology and source contract are recorded.",
    coverage: "No verified digital-asset market-data contract is currently connected.",
    availability: "UNAVAILABLE",
    sourceFocus: "Documented data providers, official protocol disclosures and regulated-source records where relevant.",
  },
  {
    slug: "macro",
    title: "Macro and policy",
    eyebrow: "MACRO",
    description: "This coverage begins with original records from statistical agencies and central banks, then connects verified releases to research events.",
    coverage: "The official-source registry is available; structured event and release records require editorial workflow activation.",
    availability: "REQUIRES_REVIEW",
    sourceFocus: "Federal Reserve/FRED, BLS, BEA and additional official releases subject to verification.",
  },
];

export function getMarketDirectoryEntry(slug: string) {
  return marketDirectory.find((market) => market.slug === slug);
}
