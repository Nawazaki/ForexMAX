export type ObservationAsset = "RATES" | "USD" | "GOLD" | "FX" | "EQUITIES" | "OIL" | "VOLATILITY" | "MACRO" | "FISCAL";
export type ObservationFreshness = "FRESH" | "STALE";
export type ObservationStatus = "RETRIEVED" | "STALE";

export type MarketObservation = {
  id: string;
  asset: ObservationAsset;
  metric: string;
  value: number;
  previousValue: number | null;
  change: number | null;
  changePercent: number | null;
  referencePeriod: string;
  publishedAt: string | null;
  retrievedAt: string;
  source: string;
  sourceUrl: string;
  freshness: ObservationFreshness;
  status: ObservationStatus;
  staleAfterDays: number;
};

export type ObservationInput = Omit<MarketObservation, "previousValue" | "change" | "changePercent" | "freshness" | "status"> & {
  previousValue?: number | null;
  calculateChangePercent?: boolean;
};

function referencePeriodDate(referencePeriod: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(referencePeriod)) return new Date(`${referencePeriod}T00:00:00Z`);
  if (/^\d{4}-\d{2}$/.test(referencePeriod)) return new Date(`${referencePeriod}-01T00:00:00Z`);
  return null;
}

export function calculateObservationFreshness(referencePeriod: string, retrievedAt: string, staleAfterDays: number): ObservationFreshness {
  const referenceDate = referencePeriodDate(referencePeriod);
  const retrievedDate = new Date(retrievedAt);
  if (!referenceDate || Number.isNaN(referenceDate.getTime()) || Number.isNaN(retrievedDate.getTime())) return "STALE";
  const ageInDays = Math.floor((retrievedDate.getTime() - referenceDate.getTime()) / 86_400_000);
  return ageInDays > staleAfterDays ? "STALE" : "FRESH";
}

export function createMarketObservation(input: ObservationInput): MarketObservation {
  const previousValue = input.previousValue ?? null;
  const change = previousValue === null ? null : input.value - previousValue;
  const changePercent = input.calculateChangePercent && previousValue !== null && previousValue !== 0
    ? (change! / previousValue) * 100
    : null;
  const freshness = calculateObservationFreshness(input.referencePeriod, input.retrievedAt, input.staleAfterDays);

  return {
    id: input.id,
    asset: input.asset,
    metric: input.metric,
    value: input.value,
    previousValue,
    change,
    changePercent,
    referencePeriod: input.referencePeriod,
    publishedAt: input.publishedAt,
    retrievedAt: input.retrievedAt,
    source: input.source,
    sourceUrl: input.sourceUrl,
    freshness,
    status: freshness === "STALE" ? "STALE" : "RETRIEVED",
    staleAfterDays: input.staleAfterDays,
  };
}

export function observationFreshnessLabel(freshness: ObservationFreshness) {
  return freshness === "FRESH" ? "Latest official observation (source-dated)" : "Stale source observation";
}

export function observationStatusLabel(status: ObservationStatus) {
  return status === "RETRIEVED" ? "Retrieved from named source" : "Stale; no replacement shown";
}
