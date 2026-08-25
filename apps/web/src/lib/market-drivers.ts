export type MarketDriverFramework = {
  asset: string;
  label: string;
  driver: string;
  sourceContracts: string[];
  requiredEvidence: string;
};

export const marketDriverFrameworks: MarketDriverFramework[] = [
  { asset: "XAUUSD", label: "Gold / U.S. dollar", driver: "Nominal and real Treasury yields", sourceContracts: ["FRED DGS10", "FRED DFII10"], requiredEvidence: "Timestamped rate observations plus a named gold-price data contract before any directional classification." },
  { asset: "XAUUSD", label: "Gold / U.S. dollar", driver: "U.S. dollar context", sourceContracts: ["Federal Reserve H.10", "FRED DTWEXBGS"], requiredEvidence: "Source-aligned dollar observation and documented comparison window." },
  { asset: "XAUUSD", label: "Gold / U.S. dollar", driver: "Inflation and policy context", sourceContracts: ["BLS CPI", "Federal Reserve releases"], requiredEvidence: "Release period, document URL and a reviewer-approved evidence record." },
  { asset: "EURUSD", label: "EUR/USD", driver: "Rate and central-bank context", sourceContracts: ["Federal Reserve H.10", "ECB Data Portal", "Federal Reserve releases"], requiredEvidence: "Publisher records for both policy areas and a defined comparison period." },
  { asset: "WTI", label: "WTI crude oil", driver: "Energy statistics and positioning", sourceContracts: ["EIA Open Data", "CFTC Public Reporting"], requiredEvidence: "Exact EIA series or COT report family, unit, report date and source document." },
];
