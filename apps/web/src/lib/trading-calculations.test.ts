import { describe, expect, it } from "vitest";
import { calculatePositionSize, calculateRiskReward, formatUtcClock, hasValidPositionInputs, hasValidRiskRewardInputs } from "@/lib/trading-calculations";

describe("trading calculations", () => {
  it("calculates fixed monetary risk and approximate position units", () => expect(calculatePositionSize(10000, 1, 25, 0.0001)).toEqual({ money: 100, units: 40000 }));
  it("returns safe zero values when division inputs are zero or invalid", () => { expect(calculatePositionSize(10000, 1, 0, 0.0001).units).toBe(0); expect(calculatePositionSize("x", 1, 25, 0.0001).money).toBe(0); });
  it("identifies invalid position-size inputs instead of treating a zero result as a valid plan", () => { expect(hasValidPositionInputs(10000, 1, 25, 0.0001)).toBe(true); expect(hasValidPositionInputs(10000, 1, 0, 0.0001)).toBe(false); expect(hasValidPositionInputs("x", 1, 25, 0.0001)).toBe(false); });
  it("calculates risk-reward and break-even consistently", () => { expect(calculateRiskReward(1.1, 1.095, 1.11).ratio).toBeCloseTo(2); expect(calculateRiskReward(1.1, 1.095, 1.11).breakEvenPercent).toBeCloseTo(33.333); expect(calculateRiskReward(1.1, 1.1, 1.11).ratio).toBe(0); });
  it("identifies invalid risk-reward inputs when entry and stop coincide or values are malformed", () => { expect(hasValidRiskRewardInputs(1.1, 1.095, 1.11)).toBe(true); expect(hasValidRiskRewardInputs(1.1, 1.1, 1.11)).toBe(false); expect(hasValidRiskRewardInputs("x", 1.095, 1.11)).toBe(false); });
  it("formats a clock in UTC", () => expect(formatUtcClock(new Date("2026-01-01T12:34:56.000Z"))).toContain("UTC"));
});
