export type EconomicEvent = {
  id: string;
  event: string;
  country: string;
  institution: string;
  releaseTime?: string;
  referencePeriod?: string;
  previous?: number | string;
  forecast?: number | string;
  actual?: number | string;
  surprise?: number | string;
  importance?: "LOW" | "MEDIUM" | "HIGH";
  sourceUrl: string;
  affectedAssets?: string[];
  historicalContext?: string;
  sourceState: "SOURCE_CONTRACT" | "RETRIEVED" | "VERIFIED" | "STALE";
};

export type EventDisplayField = { label: string; value: string };

export function presentEconomicEventFields(event: EconomicEvent): EventDisplayField[] {
  const candidates: Array<[string, string | number | undefined]> = [
    ["Release time", event.releaseTime], ["Reference period", event.referencePeriod], ["Previous", event.previous], ["Forecast", event.forecast], ["Actual", event.actual], ["Surprise", event.surprise], ["Importance", event.importance], ["Affected assets", event.affectedAssets?.join(", ")], ["Historical context", event.historicalContext],
  ];
  return candidates.filter(([, value]) => value !== undefined && value !== "").map(([label, value]) => ({ label, value: String(value) }));
}

export const economicEventContracts: EconomicEvent[] = [
  { id: "us-cpi", event: "U.S. Consumer Price Index", country: "United States", institution: "U.S. Bureau of Labor Statistics", sourceUrl: "https://www.bls.gov/cpi/", affectedAssets: ["Rates", "USD", "Gold", "FX"], sourceState: "SOURCE_CONTRACT" },
  { id: "us-employment-situation", event: "U.S. Employment Situation", country: "United States", institution: "U.S. Bureau of Labor Statistics", sourceUrl: "https://www.bls.gov/news.release/empsit.toc.htm", affectedAssets: ["Rates", "USD", "Gold", "FX", "Equities"], sourceState: "SOURCE_CONTRACT" },
  { id: "fed-policy", event: "Federal Reserve policy decision", country: "United States", institution: "Board of Governors of the Federal Reserve System", sourceUrl: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", affectedAssets: ["Rates", "USD", "Gold", "FX", "Equities"], sourceState: "SOURCE_CONTRACT" },
];
