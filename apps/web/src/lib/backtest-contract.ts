import { z } from "zod";

export const approvedBacktestAssetSchema = z.enum(["SP500", "EURUSD", "USDJPY"]);
export const approvedStrategySchema = z.literal("SMA_CROSSOVER");

export const strategyBacktestRequestSchema = z.object({
  mode: z.literal("STRATEGY"),
  asset: approvedBacktestAssetSchema,
  strategy: approvedStrategySchema,
  periodYears: z.coerce.number().int().min(1).max(5),
  fastWindow: z.coerce.number().int().min(2).max(60),
  slowWindow: z.coerce.number().int().min(5).max(120),
  initialCapital: z.coerce.number().finite().min(1_000).max(10_000_000),
  feeBps: z.coerce.number().finite().min(0).max(100),
  slippageBps: z.coerce.number().finite().min(0).max(100),
  leverage: z.coerce.number().finite().min(1).max(3),
}).superRefine((input, context) => {
  if (input.fastWindow >= input.slowWindow) context.addIssue({ code: "custom", path: ["fastWindow"], message: "Fast window must be smaller than slow window." });
});

export type StrategyBacktestRequest = z.infer<typeof strategyBacktestRequestSchema>;

export type BacktestBar = { referenceDate: string; close: number };

export type DatasetProvenance = {
  asset: StrategyBacktestRequest["asset"];
  label: string;
  seriesId: string;
  publisher: string;
  sourceUrl: string;
  frequency: "DAILY";
  marketTimestampPolicy: "SOURCE_DATE_ONLY";
  releaseTimestamp: null;
  retrievalTimestamp: string;
  referencePeriodStart: string;
  referencePeriodEnd: string;
  adjustmentPolicy: "AS_PUBLISHED_REFERENCE_SERIES";
  dataVersion: string;
};

export type BacktestTrade = {
  id: string;
  side: "LONG" | "SHORT";
  entryTimestamp: string;
  exitTimestamp: string;
  entryPrice: number;
  exitPrice: number;
  grossReturnPct: number;
  netPnl: number;
  fees: number;
  slippage: number;
};

export type EquityPoint = { referenceDate: string; equity: number; drawdownPct: number };

export type BacktestMetrics = {
  endingEquity: number;
  pnl: number;
  totalReturnPct: number;
  winRatePct: number | null;
  profitFactor: number | null;
  maxDrawdownPct: number;
  sharpeRatio: number | null;
  numberOfTrades: number;
  averageTrade: number | null;
  totalFees: number;
  totalSlippage: number;
};

export type StrategyBacktestResult = {
  mode: "STRATEGY";
  status: "COMPLETED";
  strategy: { id: "SMA_CROSSOVER"; fastWindow: number; slowWindow: number; signalPolicy: "PRIOR_OBSERVATIONS_ONLY"; fillPolicy: "NEXT_VALID_REFERENCE_CLOSE" };
  dataset: DatasetProvenance;
  metrics: BacktestMetrics;
  equityCurve: EquityPoint[];
  trades: BacktestTrade[];
  assumptions: string[];
  limitations: string[];
};

export type ResearchBacktestUnavailable = {
  mode: "RESEARCH_EVENT";
  status: "BLOCKED";
  code: "VERIFIED_EVENT_DATASET_REQUIRED";
  detail: string;
  requiredProvenance: string[];
};

export function researchBacktestUnavailable(): ResearchBacktestUnavailable {
  return {
    mode: "RESEARCH_EVENT",
    status: "BLOCKED",
    code: "VERIFIED_EVENT_DATASET_REQUIRED",
    detail: "No verified event dataset with release-time and information-cutoff provenance is connected. ForexMax will not create an event-reaction result from incomplete event data.",
    requiredProvenance: ["event timestamp", "release timestamp", "reference period", "timezone", "source URL", "retrieval timestamp", "information cutoff", "dataset version"],
  };
}
