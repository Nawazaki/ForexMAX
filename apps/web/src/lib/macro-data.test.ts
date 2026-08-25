import { describe, expect, it } from "vitest";
import { parseFredYieldCsv, sparklinePoints } from "@/lib/macro-data";

describe("official macro adapters", () => {
  it("keeps only numeric dated FRED yield observations", () => {
    const series = parseFredYieldCsv("observation_date,DGS10\n2026-08-19,4.65\n2026-08-20,.\n2026-08-21,4.74\n");
    expect(series).toEqual([{ date: "2026-08-19", value: 4.65 }, { date: "2026-08-21", value: 4.74 }]);
  });

  it("renders a bounded sparkline from actual parsed values", () => {
    const points = sparklinePoints([{ date: "2026-08-19", value: 4.65 }, { date: "2026-08-21", value: 4.74 }], 100, 50);
    expect(points).toBe("0.0,50.0 100.0,0.0");
  });
});
