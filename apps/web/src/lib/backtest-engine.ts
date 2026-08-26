import type { BacktestBar, BacktestTrade, EquityPoint, StrategyBacktestRequest, StrategyBacktestResult } from "@/lib/backtest-contract";

function average(values: number[]) { return values.reduce((sum, value) => sum + value, 0) / values.length; }

function sampleStandardDeviation(values: number[]) {
  if (values.length < 2) return null;
  const mean = average(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1));
}

function validateBars(bars: BacktestBar[], slowWindow: number) {
  if (bars.length <= slowWindow + 1) throw new Error(`Dataset needs more than ${slowWindow + 1} valid observations for this strategy.`);
  bars.forEach((bar, index) => {
    if (!Number.isFinite(bar.close) || bar.close <= 0) throw new Error(`Invalid source close at ${bar.referenceDate}.`);
    if (index > 0 && bars[index - 1].referenceDate >= bar.referenceDate) throw new Error("Dataset reference dates must be strictly increasing.");
  });
}

function movingAverage(bars: BacktestBar[], endExclusive: number, window: number) {
  return average(bars.slice(endExclusive - window, endExclusive).map((bar) => bar.close));
}

type OpenTrade = { side: "LONG" | "SHORT"; entryTimestamp: string; entryPrice: number; entryEquity: number; entryFees: number; entrySlippage: number };

export function runSmaCrossoverBacktest(input: StrategyBacktestRequest, bars: BacktestBar[], provenance: StrategyBacktestResult["dataset"]): StrategyBacktestResult {
  validateBars(bars, input.slowWindow);
  const transactionFeeRate = input.feeBps / 10_000;
  const transactionSlippageRate = input.slippageBps / 10_000;
  let equity = input.initialCapital;
  let peak = equity;
  let position: -1 | 0 | 1 = 0;
  let openTrade: OpenTrade | null = null;
  let totalFees = 0;
  let totalSlippage = 0;
  const trades: BacktestTrade[] = [];
  const equityCurve: EquityPoint[] = [{ referenceDate: bars[input.slowWindow].referenceDate, equity, drawdownPct: 0 }];

  const closePosition = (date: string, price: number, exitFees: number, exitSlippage: number) => {
    if (!openTrade) return;
    const rawReturn = openTrade.side === "LONG" ? price / openTrade.entryPrice - 1 : openTrade.entryPrice / price - 1;
    const grossReturnPct = rawReturn * input.leverage * 100;
    const netPnl = openTrade.entryEquity * rawReturn * input.leverage - openTrade.entryFees - openTrade.entrySlippage - exitFees - exitSlippage;
    trades.push({ id: `trade-${trades.length + 1}`, side: openTrade.side, entryTimestamp: openTrade.entryTimestamp, exitTimestamp: date, entryPrice: openTrade.entryPrice, exitPrice: price, grossReturnPct, netPnl, fees: openTrade.entryFees + exitFees, slippage: openTrade.entrySlippage + exitSlippage });
    openTrade = null;
  };

  for (let index = input.slowWindow; index < bars.length - 1; index += 1) {
    const fast = movingAverage(bars, index, input.fastWindow);
    const slow = movingAverage(bars, index, input.slowWindow);
    const desiredPosition: -1 | 1 = fast >= slow ? 1 : -1;
    const fillBar = bars[index];
    const turnover = Math.abs(desiredPosition - position);
    if (turnover > 0) {
      const baseNotional = equity * turnover;
      const fees = baseNotional * transactionFeeRate;
      const slippage = baseNotional * transactionSlippageRate;
      if (position !== 0) closePosition(fillBar.referenceDate, fillBar.close, fees / 2, slippage / 2);
      equity -= fees + slippage;
      totalFees += fees;
      totalSlippage += slippage;
      openTrade = { side: desiredPosition === 1 ? "LONG" : "SHORT", entryTimestamp: fillBar.referenceDate, entryPrice: fillBar.close, entryEquity: equity, entryFees: fees / 2, entrySlippage: slippage / 2 };
      position = desiredPosition;
    }

    const nextBar = bars[index + 1];
    const referenceReturn = nextBar.close / fillBar.close - 1;
    equity *= 1 + position * referenceReturn * input.leverage;
    peak = Math.max(peak, equity);
    equityCurve.push({ referenceDate: nextBar.referenceDate, equity, drawdownPct: peak === 0 ? 0 : ((equity / peak) - 1) * 100 });
  }

  const finalBar = bars.at(-1)!;
  if (position !== 0) {
    const exitNotional = equity;
    const fees = exitNotional * transactionFeeRate;
    const slippage = exitNotional * transactionSlippageRate;
    equity -= fees + slippage;
    totalFees += fees;
    totalSlippage += slippage;
    closePosition(finalBar.referenceDate, finalBar.close, fees, slippage);
    peak = Math.max(peak, equity);
    const existing = equityCurve.at(-1);
    if (existing?.referenceDate === finalBar.referenceDate) { existing.equity = equity; existing.drawdownPct = peak === 0 ? 0 : ((equity / peak) - 1) * 100; }
  }

  const dailyReturns = equityCurve.slice(1).map((point, index) => point.equity / equityCurve[index].equity - 1);
  const dailyDeviation = sampleStandardDeviation(dailyReturns);
  const winners = trades.filter((trade) => trade.netPnl > 0);
  const losses = trades.filter((trade) => trade.netPnl < 0);
  const totalGain = winners.reduce((sum, trade) => sum + trade.netPnl, 0);
  const totalLoss = losses.reduce((sum, trade) => sum + Math.abs(trade.netPnl), 0);
  const maxDrawdownPct = Math.min(...equityCurve.map((point) => point.drawdownPct));
  const endingEquity = equityCurve.at(-1)?.equity ?? input.initialCapital;

  return {
    mode: "STRATEGY",
    status: "COMPLETED",
    strategy: { id: "SMA_CROSSOVER", fastWindow: input.fastWindow, slowWindow: input.slowWindow, signalPolicy: "PRIOR_OBSERVATIONS_ONLY", fillPolicy: "NEXT_VALID_REFERENCE_CLOSE" },
    dataset: provenance,
    metrics: {
      endingEquity,
      pnl: endingEquity - input.initialCapital,
      totalReturnPct: (endingEquity / input.initialCapital - 1) * 100,
      winRatePct: trades.length ? (winners.length / trades.length) * 100 : null,
      profitFactor: totalLoss > 0 ? totalGain / totalLoss : totalGain > 0 ? null : null,
      maxDrawdownPct,
      sharpeRatio: dailyDeviation && dailyDeviation > 0 ? (average(dailyReturns) / dailyDeviation) * Math.sqrt(252) : null,
      numberOfTrades: trades.length,
      averageTrade: trades.length ? trades.reduce((sum, trade) => sum + trade.netPnl, 0) / trades.length : null,
      totalFees,
      totalSlippage,
    },
    equityCurve,
    trades,
    assumptions: [
      "Signals use only observations available before the model fill date.",
      "Each position is filled at the next valid daily source reference close, not an intraday or broker price.",
      `Fee assumption: ${input.feeBps} basis points per one-way notional; slippage assumption: ${input.slippageBps} basis points per one-way notional.`,
      `Exposure is normalized to one position and applies ${input.leverage}x leverage to reference-series return.`,
    ],
    limitations: [
      "This is a historical reference-series simulation, not realistic broker execution.",
      "The dataset is as-published daily FRED reference data; it is not an adjusted total-return, spread, liquidity, borrow-cost or intraday feed.",
      "No corporate actions, financing, taxes, partial fills, margin calls, stop orders or portfolio allocation are modeled.",
    ],
  };
}
