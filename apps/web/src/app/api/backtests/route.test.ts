import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BacktestBar, DatasetProvenance } from "@/lib/backtest-contract";

const bars: BacktestBar[] = Array.from({ length: 130 }, (_, index) => ({ referenceDate: `2024-01-${String(index + 1).padStart(3, "0")}`, close: 100 + index }));
const provenance: DatasetProvenance = { asset: "SP500", label: "S&P 500 index", seriesId: "SP500", publisher: "FRED", sourceUrl: "https://fred.stlouisfed.org/series/SP500", frequency: "DAILY", marketTimestampPolicy: "SOURCE_DATE_ONLY", releaseTimestamp: null, retrievalTimestamp: "2024-02-01T00:00:00.000Z", referencePeriodStart: bars[0].referenceDate, referencePeriodEnd: bars.at(-1)!.referenceDate, adjustmentPolicy: "AS_PUBLISHED_REFERENCE_SERIES", dataVersion: "TEST" };

const mocks = vi.hoisted(() => ({ loadApprovedBacktestDataset: vi.fn() }));
vi.mock("@/lib/backtest-datasets", () => ({ loadApprovedBacktestDataset: mocks.loadApprovedBacktestDataset }));

import { GET, POST } from "@/app/api/backtests/route";

const validRequest = { mode: "STRATEGY", asset: "SP500", strategy: "SMA_CROSSOVER", periodYears: 1, fastWindow: 5, slowWindow: 20, initialCapital: 20_000, feeBps: 2, slippageBps: 2, leverage: 1 };

describe("/api/backtests", () => {
  beforeEach(() => {
    mocks.loadApprovedBacktestDataset.mockReset();
    mocks.loadApprovedBacktestDataset.mockResolvedValue({ bars, provenance });
  });

  it("publishes a read-only contract and keeps event research blocked", async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.researchBacktest.code).toBe("VERIFIED_EVENT_DATASET_REQUIRED");
    expect(body.security).toContain("No user code");
  });

  it("runs only a validated approved request", async () => {
    const response = await POST(new Request("http://localhost/api/backtests", { method: "POST", body: JSON.stringify(validRequest), headers: { "Content-Type": "application/json" } }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe("COMPLETED");
    expect(mocks.loadApprovedBacktestDataset).toHaveBeenCalledWith(expect.objectContaining({ asset: "SP500", periodYears: 1 }));
  });

  it("rejects arbitrary strategy fields before the dataset adapter runs", async () => {
    const response = await POST(new Request("http://localhost/api/backtests", { method: "POST", body: JSON.stringify({ ...validRequest, strategy: "import os" }), headers: { "Content-Type": "application/json" } }));
    expect(response.status).toBe(400);
    expect(mocks.loadApprovedBacktestDataset).not.toHaveBeenCalled();
  });
});
