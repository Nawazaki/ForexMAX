import { describe, expect, it } from "vitest";
import { calculateObservationFreshness, createMarketObservation } from "@/lib/market-observation";

describe("market observation contract", () => {
  it("keeps a reversible current-prior change with a mathematically valid percentage change", () => {
    const observation = createMarketObservation({
      id: "test-index", asset: "EQUITIES", metric: "Test index", value: 120, previousValue: 100, calculateChangePercent: true,
      referencePeriod: "2026-08-24", publishedAt: null, retrievedAt: "2026-08-25T12:00:00.000Z", source: "Official source", sourceUrl: "https://example.gov", staleAfterDays: 10,
    });
    expect(observation.change).toBe(20);
    expect(observation.changePercent).toBe(20);
    expect(observation.value - observation.previousValue!).toBe(observation.change);
  });

  it("does not manufacture a prior delta or percentage when no prior value exists", () => {
    const observation = createMarketObservation({
      id: "test-release", asset: "MACRO", metric: "Test release", value: 4.1, previousValue: null, calculateChangePercent: true,
      referencePeriod: "2026-07", publishedAt: null, retrievedAt: "2026-08-25T12:00:00.000Z", source: "Official source", sourceUrl: "https://example.gov", staleAfterDays: 75,
    });
    expect(observation.change).toBeNull();
    expect(observation.changePercent).toBeNull();
  });

  it("marks an old dated record stale rather than replacing it", () => {
    expect(calculateObservationFreshness("2026-08-01", "2026-08-25T12:00:00.000Z", 10)).toBe("STALE");
  });
});
