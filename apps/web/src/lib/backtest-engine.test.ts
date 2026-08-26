import { describe, expect, it } from "vitest";
import { runSmaCrossoverBacktest } from "@/lib/backtest-engine";
import type { BacktestBar, DatasetProvenance, StrategyBacktestRequest } from "@/lib/backtest-contract";

const bars: BacktestBar[] = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111].map((close, index) => ({ referenceDate: `2024-01-${String(index + 2).padStart(2, "0")}`, close }));
const request: StrategyBacktestRequest = { mode: "STRATEGY", asset: "SP500", strategy: "SMA_CROSSOVER", periodYears: 1, fastWindow: 2, slowWindow: 4, initialCapital: 10_000, feeBps: 0, slippageBps: 0, leverage: 1 };
const provenance: DatasetProvenance = { asset: "SP500", label: "Test reference series", seriesId: "TEST", publisher: "Test publisher", sourceUrl: "https://example.test", frequency: "DAILY", marketTimestampPolicy: "SOURCE_DATE_ONLY", releaseTimestamp: null, retrievalTimestamp: "2024-02-01T00:00:00.000Z", referencePeriodStart: bars[0].referenceDate, referencePeriodEnd: bars.at(-1)!.referenceDate, adjustmentPolicy: "AS_PUBLISHED_REFERENCE_SERIES", dataVersion: "TEST" };

describe("runSmaCrossoverBacktest", () => {
  it("uses prior observations only and does not fill before the slow-window boundary", () => {
    const result = runSmaCrossoverBacktest(request, bars, provenance);
    expect(result.trades[0].entryTimestamp).toBe(bars[request.slowWindow].referenceDate);
    expect(result.strategy.signalPolicy).toBe("PRIOR_OBSERVATIONS_ONLY");
    expect(result.metrics.endingEquity).toBeGreaterThan(request.initialCapital);
  });

  it("reduces return and records costs when fees and slippage are applied", () => {
    const withoutCosts = runSmaCrossoverBacktest(request, bars, provenance);
    const withCosts = runSmaCrossoverBacktest({ ...request, feeBps: 10, slippageBps: 5 }, bars, provenance);
    expect(withCosts.metrics.endingEquity).toBeLessThan(withoutCosts.metrics.endingEquity);
    expect(withCosts.metrics.totalFees).toBeGreaterThan(0);
    expect(withCosts.metrics.totalSlippage).toBeGreaterThan(0);
  });

  it("rejects unordered or insufficient source data", () => {
    expect(() => runSmaCrossoverBacktest(request, bars.slice(0, 5), provenance)).toThrow(/needs more/);
    expect(() => runSmaCrossoverBacktest(request, [{ ...bars[0] }, { ...bars[0] }, ...bars.slice(2)], provenance)).toThrow(/strictly increasing/);
  });
});
