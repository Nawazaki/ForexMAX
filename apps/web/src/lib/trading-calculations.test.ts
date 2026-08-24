import { describe, expect, it } from "vitest";
import { calculatePositionSize, calculateRiskReward, formatUtcClock } from "@/lib/trading-calculations";

describe("trading calculations", () => {
  it("calculates fixed monetary risk and approximate position units", () => expect(calculatePositionSize(10000, 1, 25, 0.0001)).toEqual({ money: 100, units: 40000 }));
  it("returns safe zero values when division inputs are zero or invalid", () => { expect(calculatePositionSize(10000, 1, 0, 0.0001).units).toBe(0); expect(calculatePositionSize("x", 1, 25, 0.0001).money).toBe(0); });
  it("calculates risk-reward and break-even consistently", () => { expect(calculateRiskReward(1.1, 1.095, 1.11).ratio).toBeCloseTo(2); expect(calculateRiskReward(1.1, 1.095, 1.11).breakEvenPercent).toBeCloseTo(33.333); expect(calculateRiskReward(1.1, 1.1, 1.11).ratio).toBe(0); });
  it("formats a clock in UTC", () => expect(formatUtcClock(new Date("2026-01-01T12:34:56.000Z"))).toContain("UTC"));
});
