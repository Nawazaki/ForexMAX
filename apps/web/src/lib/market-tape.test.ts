import { describe, expect, it } from "vitest";
import { marketTapeItemFromPoints, parseFredSeriesCsv } from "@/lib/market-tape";

const definition = { id: "test-rate", group: "RATES" as const, label: "Test rate", seriesId: "TEST", sourceName: "Official source", sourceUrl: "https://example.gov/series", unit: "PERCENT" as const, precision: 2, note: "Test-only definition." };

describe("market tape", () => {
  it("retains only dated numeric FRED observations", () => {
    expect(parseFredSeriesCsv("observation_date,TEST\n2026-08-19,4.65\n2026-08-20,.\n2026-08-21,4.74\n")).toEqual([{ date: "2026-08-19", value: 4.65 }, { date: "2026-08-21", value: 4.74 }]);
  });

  it("calculates a reversible latest-versus-prior change without creating a market call", () => {
    const item = marketTapeItemFromPoints(definition, [{ date: "2026-08-19", value: 4.65 }, { date: "2026-08-21", value: 4.74 }], "2026-08-25T12:00:00.000Z");
    expect(item.valueLabel).toBe("4.74%");
    expect(item.change).toBeCloseTo(0.09);
    expect(item.changeLabel).toBe("+0.09 percentage points");
    expect(item.state).toBe("CURRENT");
  });

  it("marks an observation stale instead of substituting a new value", () => {
    const item = marketTapeItemFromPoints(definition, [{ date: "2026-08-01", value: 4.65 }, { date: "2026-08-02", value: 4.74 }], "2026-08-25T12:00:00.000Z");
    expect(item.state).toBe("STALE");
  });
});
