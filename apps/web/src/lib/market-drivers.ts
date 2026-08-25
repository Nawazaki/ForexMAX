export type DriverCategory = "OBSERVED_CONTEXT" | "CATALYST_WATCH" | "RISK" | "COUNTER_EVIDENCE";

export type MarketDriverFramework = {
  asset: "XAUUSD" | "EURUSD" | "USDJPY" | "US10Y" | "SP500" | "WTI";
  label: string;
  driver: string;
  category: DriverCategory;
  observationIds: string[];
  eventIds: string[];
  sourceContracts: string[];
  requiredEvidence: string;
};

export const marketDriverFrameworks: MarketDriverFramework[] = [
  { asset: "XAUUSD", label: "Gold / real yields", driver: "Nominal and real Treasury yields", category: "OBSERVED_CONTEXT", observationIds: ["us-10y", "us-10y-real"], eventIds: ["us-cpi", "fed-policy"], sourceContracts: ["FRED DGS10", "FRED DFII10"], requiredEvidence: "Dated rate observations are visible. A gold-price observation, matched comparison window and editorial evidence are still required before classifying a supporting or pressuring factor." },
  { asset: "XAUUSD", label: "Gold / dollar", driver: "Broad U.S. dollar context", category: "COUNTER_EVIDENCE", observationIds: ["broad-usd"], eventIds: ["us-cpi", "fed-policy"], sourceContracts: ["Federal Reserve H.10", "FRED DTWEXBGS"], requiredEvidence: "A source-aligned dollar observation and documented comparison period must be preserved beside any gold-specific claim." },
  { asset: "XAUUSD", label: "Gold / macro", driver: "Inflation and policy release context", category: "CATALYST_WATCH", observationIds: ["us-cpi", "us-unemployment"], eventIds: ["us-cpi", "fed-policy"], sourceContracts: ["BLS CPI", "Federal Reserve releases"], requiredEvidence: "A source release, reference period, actual field and a reviewer-approved evidence record are required before a causal statement." },
  { asset: "EURUSD", label: "EUR/USD / U.S. context", driver: "Published EUR/USD, dollar and U.S. rates", category: "OBSERVED_CONTEXT", observationIds: ["eurusd", "broad-usd", "us-10y", "us-10y-real"], eventIds: ["us-cpi", "fed-policy"], sourceContracts: ["Federal Reserve H.10", "FRED DEXUSEU", "FRED DGS10"], requiredEvidence: "The visible observations are U.S.-side context. ECB policy and euro-area data must be documented before a policy-differential or directional claim." },
  { asset: "EURUSD", label: "EUR/USD / missing side", driver: "Euro-area source gap", category: "COUNTER_EVIDENCE", observationIds: [], eventIds: [], sourceContracts: ["ECB Data Portal"], requiredEvidence: "No ECB release-calendar record or euro-area observation is connected, so the public desk does not label the EUR/USD record as supportive or pressuring." },
  { asset: "USDJPY", label: "USD/JPY / published rate", driver: "USD/JPY, broad dollar and U.S. rates", category: "OBSERVED_CONTEXT", observationIds: ["usdjpy", "broad-usd", "us-10y"], eventIds: ["us-cpi", "fed-policy"], sourceContracts: ["Federal Reserve H.10", "FRED DEXJPUS", "FRED DGS10"], requiredEvidence: "The page has U.S.-side and published exchange-rate observations only. Bank of Japan policy and Japanese data are required before any differential-based interpretation." },
  { asset: "USDJPY", label: "USD/JPY / missing side", driver: "Japanese policy and macro evidence", category: "COUNTER_EVIDENCE", observationIds: [], eventIds: [], sourceContracts: ["Bank of Japan releases"], requiredEvidence: "No Bank of Japan event record or Japanese macro series is currently retrieved; the absence is explicit rather than filled with a directional label." },
  { asset: "US10Y", label: "U.S. 10Y / rates", driver: "Nominal and real 10-year observations", category: "OBSERVED_CONTEXT", observationIds: ["us-10y", "us-10y-real"], eventIds: ["us-cpi", "us-employment-situation", "fed-policy"], sourceContracts: ["FRED DGS10", "FRED DFII10"], requiredEvidence: "A complete rate assessment requires inflation expectations, auction data and policy projections in separately approved source contracts." },
  { asset: "US10Y", label: "U.S. 10Y / fiscal", driver: "Published public-debt record", category: "RISK", observationIds: ["us-public-debt"], eventIds: [], sourceContracts: ["Treasury Fiscal Data"], requiredEvidence: "The Treasury record is a fiscal balance-sheet observation, not a yield signal; no causal linkage is asserted." },
  { asset: "SP500", label: "S&P 500 / risk context", driver: "Broad equity, volatility and rates", category: "OBSERVED_CONTEXT", observationIds: ["sp500", "vix", "us-10y", "us-10y-real"], eventIds: ["us-cpi", "us-employment-situation", "fed-policy"], sourceContracts: ["FRED SP500", "FRED VIXCLS", "FRED DGS10"], requiredEvidence: "The desk displays dated context only. Earnings, breadth, valuation, options and sector records are required before an equity-market assessment." },
  { asset: "SP500", label: "S&P 500 / missing evidence", driver: "Earnings and market-breadth source gap", category: "COUNTER_EVIDENCE", observationIds: [], eventIds: [], sourceContracts: ["Company filings", "index-provider records"], requiredEvidence: "No earnings, constituent, breadth or options-flow record is currently connected; no risk-on/risk-off label is published." },
  { asset: "WTI", label: "WTI crude oil", driver: "Published oil and dollar observations", category: "OBSERVED_CONTEXT", observationIds: ["wti", "broad-usd", "vix"], eventIds: ["us-cpi", "fed-policy"], sourceContracts: ["FRED DCOILWTICO", "FRED DTWEXBGS"], requiredEvidence: "The WTI record is a dated spot observation. EIA inventory and CFTC positioning need exact public report contracts before supply-demand or positioning statements." },
];

export const driverCategoryLabels: Record<DriverCategory, string> = {
  OBSERVED_CONTEXT: "Observed context",
  CATALYST_WATCH: "Catalyst watch",
  RISK: "Risk boundary",
  COUNTER_EVIDENCE: "Counter-evidence / source gap",
};
