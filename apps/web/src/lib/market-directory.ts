import type { DataQualityState } from "@/lib/research-status";

export type MarketDirectoryEntry = {
  slug: "forex" | "commodities" | "indices" | "crypto" | "macro";
  title: string;
  eyebrow: string;
  description: string;
  coverage: string;
  availability: DataQualityState;
  sourceFocus: string;
  sourceIds: string[];
  publicationBoundary: string;
  deskRoute?: "/macro";
};

export const marketDirectory: MarketDirectoryEntry[] = [
  {
    slug: "forex",
    title: "Foreign exchange",
    eyebrow: "FX",
    description: "Currency-market research begins with macro releases and central-bank context. ForexMax does not present this coverage as a live FX-price service.",
    coverage: "Research framing for EUR/USD, GBP/USD and USD/JPY is available; a verified live-price contract is deliberately not activated.",
    availability: "UNAVAILABLE",
    sourceFocus: "Central-bank publications, official statistics and named market-data contracts.",
    sourceIds: ["federal-reserve-fred", "ecb-data-portal", "bank-of-england-database", "bank-of-japan-time-series"],
    publicationBoundary: "A public FX assessment needs linked releases, the reference period, a documented price-data basis where used, and editorial review."
  },
  {
    slug: "commodities",
    title: "Commodities",
    eyebrow: "COMMODITIES",
    description: "Commodity research separates regulated positioning and energy statistics from price charts or directional calls.",
    coverage: "Official energy and positioning-source contracts are mapped; no verified live gold or oil feed is presented on this research surface.",
    availability: "UNAVAILABLE",
    sourceFocus: "Official energy releases, CFTC reporting and documented market-data contracts.",
    sourceIds: ["eia-open-data", "cftc-public-reporting"],
    publicationBoundary: "A commodity record must identify its report family, report date, unit and source methodology before evidence can support publication."
  },
  {
    slug: "indices",
    title: "Indices",
    eyebrow: "INDICES",
    description: "Index coverage requires a traceable market-data basis and separation between constituent facts, market data and editorial interpretation.",
    coverage: "The coverage model is defined, but no official index-provider or exchange snapshot contract is active in this version.",
    availability: "UNAVAILABLE",
    sourceFocus: "Named exchange data, index-provider methodology and source-backed research records.",
    sourceIds: [],
    publicationBoundary: "No index level, chart or performance statement is published until an exact provider, symbol, frequency and freshness policy are documented."
  },
  {
    slug: "crypto",
    title: "Digital assets",
    eyebrow: "CRYPTO",
    description: "Digital-asset research keeps protocol disclosures, regulatory records, market data and opinion distinct.",
    coverage: "The research protocol is available; no verified digital-asset market-data contract is active on the public desk.",
    availability: "UNAVAILABLE",
    sourceFocus: "Documented providers, official protocol disclosures and regulated-source records where relevant.",
    sourceIds: [],
    publicationBoundary: "No price, liquidity, probability or directional statement appears without a named dataset, retrieval time, evidence record and editorial review."
  },
  {
    slug: "macro",
    title: "Macro and policy",
    eyebrow: "MACRO",
    description: "Macro coverage begins with original records from statistical agencies and central banks, then connects verified releases to research events.",
    coverage: "The public desk reads limited current BLS, FRED and Treasury observations; structured event and release records still require editorial workflow activation.",
    availability: "REQUIRES_REVIEW",
    sourceFocus: "Federal Reserve/FRED, BLS, U.S. Treasury Fiscal Data and BEA releases subject to documented verification.",
    sourceIds: ["federal-reserve-fred", "bls-cpi", "us-treasury-fiscal-data", "bea"],
    publicationBoundary: "An observation is not a policy path or market reaction. Research publication requires a preserved source record, evidence and human review.",
    deskRoute: "/macro"
  },
];

export function getMarketDirectoryEntry(slug: string) {
  return marketDirectory.find((market) => market.slug === slug);
}
