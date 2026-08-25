import { describe, expect, it } from "vitest";
import { deduplicateObservations } from "@/lib/cross-asset-intelligence";

const base = { asset: "RATES" as const, metric: "U.S. 10-year Treasury rate", value: 4.74, previousValue: 4.69, change: 0.05, changePercent: null, referencePeriod: "2026-08-24", publishedAt: null, retrievedAt: "2026-08-25T12:00:00.000Z", source: "FRED", sourceUrl: "https://fred.stlouisfed.org/series/DGS10", freshness: "FRESH" as const, status: "RETRIEVED" as const, staleAfterDays: 10 };

describe("cross-asset snapshot", () => {
  it("retains one source observation per id when rate context appears in both source adapters", () => {
    expect(deduplicateObservations([{ ...base, id: "us-10y" }, { ...base, id: "us-10y", value: 4.75 }])).toEqual([{ ...base, id: "us-10y" }]);
  });
});
