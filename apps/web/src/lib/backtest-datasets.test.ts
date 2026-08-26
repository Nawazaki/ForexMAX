import { describe, expect, it } from "vitest";
import { parseFredBacktestCsv } from "@/lib/backtest-datasets";

describe("parseFredBacktestCsv", () => {
  it("keeps valid dated FRED observations and removes missing values", () => {
    expect(parseFredBacktestCsv("observation_date,SP500\n2024-01-02,4742.83\n2024-01-03,.\n2024-01-04,4688.68\n")).toEqual([
      { referenceDate: "2024-01-02", close: 4742.83 },
      { referenceDate: "2024-01-04", close: 4688.68 },
    ]);
  });
});
