export type EconomicEvent = {
  id: string;
  event: string;
  country: string;
  institution: string;
  releaseTime?: string | null;
  referencePeriod?: string | null;
  previous?: number | string | null;
  forecast?: number | string | null;
  actual?: number | string | null;
  surprise?: number | string | null;
  source?: string | null;
  sourceUrl: string;
  importance?: "LOW" | "MEDIUM" | "HIGH" | null;
  affectedAssets?: string[] | null;
  historicalContext?: string | null;
  sourceState: "SOURCE_CONTRACT" | "RETRIEVED" | "VERIFIED" | "STALE";
};

export type EventDisplayField = { label: string; value: string };

export function presentEconomicEventFields(event: EconomicEvent): EventDisplayField[] {
  const candidates: Array<[string, string | number | null | undefined]> = [
    ["Release time", event.releaseTime], ["Reference period", event.referencePeriod], ["Previous", event.previous], ["Forecast", event.forecast], ["Actual", event.actual], ["Surprise", event.surprise], ["Importance", event.importance], ["Affected assets", event.affectedAssets?.join(", ") || null], ["Historical context", event.historicalContext],
  ];
  return candidates.filter(([, value]) => value !== null && value !== undefined && value !== "").map(([label, value]) => ({ label, value: String(value) }));
}

export const economicEventContracts: EconomicEvent[] = [
  { id: "us-cpi", event: "U.S. Consumer Price Index", country: "United States", institution: "U.S. Bureau of Labor Statistics", releaseTime: null, referencePeriod: null, previous: null, forecast: null, actual: null, surprise: null, source: "U.S. Bureau of Labor Statistics", sourceUrl: "https://www.bls.gov/cpi/", importance: null, affectedAssets: ["Rates", "USD", "Gold", "FX"], historicalContext: null, sourceState: "SOURCE_CONTRACT" },
  { id: "us-employment-situation", event: "U.S. Employment Situation", country: "United States", institution: "U.S. Bureau of Labor Statistics", releaseTime: null, referencePeriod: null, previous: null, forecast: null, actual: null, surprise: null, source: "U.S. Bureau of Labor Statistics", sourceUrl: "https://www.bls.gov/news.release/empsit.toc.htm", importance: null, affectedAssets: ["Rates", "USD", "Gold", "FX", "Equities"], historicalContext: null, sourceState: "SOURCE_CONTRACT" },
  { id: "fed-policy", event: "Federal Reserve policy decision", country: "United States", institution: "Board of Governors of the Federal Reserve System", releaseTime: null, referencePeriod: null, previous: null, forecast: null, actual: null, surprise: null, source: "Board of Governors of the Federal Reserve System", sourceUrl: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", importance: null, affectedAssets: ["Rates", "USD", "Gold", "FX", "Equities"], historicalContext: null, sourceState: "SOURCE_CONTRACT" },
];
