import { NextResponse } from "next/server";
import { researchBacktestUnavailable, strategyBacktestRequestSchema } from "@/lib/backtest-contract";
import { loadApprovedBacktestDataset } from "@/lib/backtest-datasets";
import { runSmaCrossoverBacktest } from "@/lib/backtest-engine";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  return json({
    service: "ForexMax Backtest API",
    execution: "SERVER_SIDE_TYPESCRIPT",
    allowed: { modes: ["STRATEGY"], strategies: ["SMA_CROSSOVER"], assets: ["SP500", "EURUSD", "USDJPY"] },
    researchBacktest: researchBacktestUnavailable(),
    security: ["No Python execution", "No user code", "No file upload", "No arbitrary source URL", "No database write"],
  });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = strategyBacktestRequestSchema.safeParse(payload);
  if (!parsed.success) return json({ error: "Invalid backtest request.", issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) }, 400);
  try {
    const { bars, provenance } = await loadApprovedBacktestDataset(parsed.data);
    return json(runSmaCrossoverBacktest(parsed.data, bars, provenance));
  } catch (error) {
    return json({ error: "The approved historical dataset could not be prepared.", detail: error instanceof Error ? error.message : "Unknown dataset error." }, 502);
  }
}
