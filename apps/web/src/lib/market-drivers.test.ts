import { describe, expect, it } from "vitest";
import { marketDriverFrameworks } from "@/lib/market-drivers";

describe("evidence-led market drivers", () => {
  it("only permits a driver with linked observations or an explicit counter-evidence source gap", () => {
    expect(marketDriverFrameworks.every((driver) => driver.observationIds.length > 0 || driver.category === "COUNTER_EVIDENCE")).toBe(true);
  });

  it("covers the five priority asset research routes without fabricating bullish or bearish classifications", () => {
    ["XAUUSD", "EURUSD", "USDJPY", "US10Y", "SP500"].forEach((asset) => {
      expect(marketDriverFrameworks.some((driver) => driver.asset === asset)).toBe(true);
    });
    expect(marketDriverFrameworks.every((driver) => !["BULLISH", "BEARISH"].includes(driver.category))).toBe(true);
  });
});
