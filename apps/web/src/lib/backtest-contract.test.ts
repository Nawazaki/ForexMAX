import { describe, expect, it } from "vitest";
import { researchBacktestUnavailable, strategyBacktestRequestSchema } from "@/lib/backtest-contract";

const validRequest = { mode: "STRATEGY", asset: "SP500", strategy: "SMA_CROSSOVER", periodYears: 3, fastWindow: 20, slowWindow: 60, initialCapital: 25_000, feeBps: 2, slippageBps: 3, leverage: 1 };

describe("strategyBacktestRequestSchema", () => {
  it("accepts only a bounded approved strategy request", () => expect(strategyBacktestRequestSchema.safeParse(validRequest).success).toBe(true));
  it("rejects arbitrary strategy inputs and invalid window ordering", () => {
    expect(strategyBacktestRequestSchema.safeParse({ ...validRequest, strategy: "PYTHON" }).success).toBe(false);
    expect(strategyBacktestRequestSchema.safeParse({ ...validRequest, fastWindow: 60, slowWindow: 20 }).success).toBe(false);
  });
});

describe("researchBacktestUnavailable", () => {
  it("does not manufacture an event study without verified event provenance", () => expect(researchBacktestUnavailable().code).toBe("VERIFIED_EVENT_DATASET_REQUIRED"));
});
