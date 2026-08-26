"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ResearchBacktestUnavailable, StrategyBacktestResult } from "@/lib/backtest-contract";
import styles from "./backtest-workbench.module.css";

type Mode = "STRATEGY" | "RESEARCH_EVENT";

const assetOptions = [
  { id: "SP500", label: "S&P 500", detail: "FRED SP500 · daily index reference series" },
  { id: "EURUSD", label: "EUR/USD", detail: "FRED DEXUSEU · daily U.S. dollars per euro" },
  { id: "USDJPY", label: "USD/JPY", detail: "FRED DEXJPUS · daily Japanese yen per dollar" },
] as const;

function number(value: number, digits = 2) { return new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value); }
function money(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value); }
function nullable(value: number | null, formatter: (value: number) => string) { return value === null ? "Not meaningful" : formatter(value); }

function EquityCurve({ result }: { result: StrategyBacktestResult }) {
  const points = useMemo(() => {
    const values = result.equityCurve.map((point) => point.equity);
    const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1;
    return result.equityCurve.map((point, index) => `${(index / Math.max(1, result.equityCurve.length - 1)) * 100},${92 - ((point.equity - min) / range) * 80}`).join(" ");
  }, [result]);
  return <figure className={styles.curveFigure}><figcaption><span>Equity curve</span><small>Daily model marks on the returned source-reference series.</small></figcaption><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Equity curve from backtest result"><line x1="0" y1="92" x2="100" y2="92" /><line x1="0" y1="12" x2="0" y2="92" /><polyline points={points} /></svg><div className={styles.curveAxis}><span>{result.dataset.referencePeriodStart}</span><span>{result.dataset.referencePeriodEnd}</span></div></figure>;
}

export function BacktestWorkbench() {
  const [mode, setMode] = useState<Mode>("STRATEGY");
  const [asset, setAsset] = useState<(typeof assetOptions)[number]["id"]>("SP500");
  const [periodYears, setPeriodYears] = useState(3);
  const [fastWindow, setFastWindow] = useState(20);
  const [slowWindow, setSlowWindow] = useState(60);
  const [initialCapital, setInitialCapital] = useState(25_000);
  const [feeBps, setFeeBps] = useState(2);
  const [slippageBps, setSlippageBps] = useState(3);
  const [leverage, setLeverage] = useState(1);
  const [result, setResult] = useState<StrategyBacktestResult | null>(null);
  const [researchBlocker, setResearchBlocker] = useState<ResearchBacktestUnavailable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function runStrategy() {
    setError(null); setResult(null); setResearchBlocker(null); setIsRunning(true);
    try {
      const response = await fetch("/api/backtests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "STRATEGY", asset, strategy: "SMA_CROSSOVER", periodYears, fastWindow, slowWindow, initialCapital, feeBps, slippageBps, leverage }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Backtest request could not be completed.");
      setResult(body as StrategyBacktestResult);
    } catch (runError) { setError(runError instanceof Error ? runError.message : "Backtest request could not be completed."); }
    finally { setIsRunning(false); }
  }

  async function inspectResearchMode() {
    setError(null); setResult(null); setIsRunning(true);
    try {
      const response = await fetch("/api/backtests", { cache: "no-store" });
      const body = await response.json();
      setResearchBlocker(body.researchBacktest as ResearchBacktestUnavailable);
    } catch { setError("Research-mode status could not be retrieved."); }
    finally { setIsRunning(false); }
  }

  return <>
    <section className="shell page-intro"><p className="eyebrow">BACKTEST LAB / PREVIEW</p><h1>Historical records, not a signal factory.</h1><p>Run a bounded historical simulation on approved daily reference series. Every result keeps its source, date range, data policy, cost assumptions and no-look-ahead rule visible. It is research infrastructure, not personalized financial advice.</p></section>
    <section className={`shell ${styles.workbench}`}>
      <div className={styles.modeBar} role="tablist" aria-label="Backtest mode"><button type="button" className={mode === "STRATEGY" ? styles.activeMode : ""} onClick={() => { setMode("STRATEGY"); setResearchBlocker(null); }}>Strategy Backtest</button><button type="button" className={mode === "RESEARCH_EVENT" ? styles.activeMode : ""} onClick={() => { setMode("RESEARCH_EVENT"); setResult(null); }}>Research Backtest</button><p>Server-side only · no file upload · no user code</p></div>
      {mode === "STRATEGY" ? <div className={styles.grid}>
        <aside className={styles.controls}><div><p className="eyebrow">DEFINED INPUTS</p><h2>Run a transparent rule.</h2><p className={styles.muted}>The sole MVP strategy is a daily SMA crossover. Signals use prior observations, then model-fill at the next valid source reference close.</p></div>
          <label>Asset<select value={asset} onChange={(event) => setAsset(event.target.value as typeof asset)}>{assetOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <p className={styles.inputHint}>{assetOptions.find((option) => option.id === asset)?.detail}</p>
          <div className={styles.twoCol}><label>Period<select value={periodYears} onChange={(event) => setPeriodYears(Number(event.target.value))}><option value={1}>1 year</option><option value={3}>3 years</option><option value={5}>5 years</option></select></label><label>Leverage<input type="number" min="1" max="3" step="0.25" value={leverage} onChange={(event) => setLeverage(Number(event.target.value))} /></label></div>
          <div className={styles.twoCol}><label>Fast SMA<input type="number" min="2" max="60" value={fastWindow} onChange={(event) => setFastWindow(Number(event.target.value))} /></label><label>Slow SMA<input type="number" min="5" max="120" value={slowWindow} onChange={(event) => setSlowWindow(Number(event.target.value))} /></label></div>
          <label>Initial capital (USD)<input type="number" min="1000" max="10000000" step="1000" value={initialCapital} onChange={(event) => setInitialCapital(Number(event.target.value))} /></label>
          <div className={styles.twoCol}><label>Fees (bps)<input type="number" min="0" max="100" step="0.5" value={feeBps} onChange={(event) => setFeeBps(Number(event.target.value))} /></label><label>Slippage (bps)<input type="number" min="0" max="100" step="0.5" value={slippageBps} onChange={(event) => setSlippageBps(Number(event.target.value))} /></label></div>
          <button type="button" className={styles.runButton} onClick={runStrategy} disabled={isRunning || fastWindow >= slowWindow}>{isRunning ? "Preparing source series…" : "Run historical simulation"}</button>
          {fastWindow >= slowWindow ? <p className={styles.error}>Fast SMA must be smaller than slow SMA.</p> : null}
        </aside>
        <section className={styles.results} aria-live="polite">{error ? <div className={styles.errorPanel}><strong>Request not completed.</strong><p>{error}</p></div> : null}{result ? <StrategyResult result={result} /> : <ResultEmpty />}</section>
      </div> : <ResearchMode blocker={researchBlocker} isRunning={isRunning} onInspect={inspectResearchMode} />}
    </section>
    <section className={`shell ${styles.forensics}`}><p className="eyebrow">MARKET FORENSICS</p><div><h2>Historical analogue work needs event provenance.</h2><p>Future CPI, FOMC, NFP and central-bank studies will require a verified event timestamp, release timestamp, information cutoff, data version, source URL and timezone before a 1D/3D/5D distribution can be calculated. ForexMax does not infer or fabricate those historical events from a market chart.</p></div><Link href="/methodology">Read the evidence methodology →</Link></section>
  </>;
}

function ResultEmpty() { return <div className={styles.emptyResult}><p className="eyebrow">AWAITING A DEFINED RUN</p><h2>Source and method before the metric.</h2><p>Select a supported reference series and bounded assumptions. The engine will retrieve the actual FRED window on the server, validate the records and return only a reproducible result or a clear source error.</p><dl><div><dt>Approved datasets</dt><dd>S&P 500, EUR/USD and USD/JPY daily FRED series.</dd></div><div><dt>Gold boundary</dt><dd>Gold remains excluded until an eligible historical price-source contract is connected.</dd></div><div><dt>Research mode</dt><dd>Blocked until a verified event dataset exists.</dd></div></dl></div>; }

function StrategyResult({ result }: { result: StrategyBacktestResult }) { const { metrics } = result; return <div className={styles.resultBody}><div className={styles.resultHeader}><div><p className="eyebrow">COMPLETED / SOURCE-AWARE</p><h2>{result.dataset.label} · SMA {result.strategy.fastWindow}/{result.strategy.slowWindow}</h2><p>{result.dataset.referencePeriodStart} to {result.dataset.referencePeriodEnd} · retrieved {new Date(result.dataset.retrievalTimestamp).toLocaleString("en-GB", { timeZone: "UTC", timeZoneName: "short" })}</p></div><a href={result.dataset.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a></div><div className={styles.metricGrid}><Metric label="Ending equity" value={money(metrics.endingEquity)} /><Metric label="PnL" value={money(metrics.pnl)} /><Metric label="Total return" value={`${number(metrics.totalReturnPct)}%`} /><Metric label="Max drawdown" value={`${number(metrics.maxDrawdownPct)}%`} /><Metric label="Win rate" value={nullable(metrics.winRatePct, (value) => `${number(value)}%`)} /><Metric label="Profit factor" value={nullable(metrics.profitFactor, (value) => number(value))} /><Metric label="Trades" value={String(metrics.numberOfTrades)} /><Metric label="Sharpe" value={nullable(metrics.sharpeRatio, (value) => number(value))} /></div><EquityCurve result={result} /><div className={styles.detailGrid}><section><h3>Data provenance</h3><dl><div><dt>Publisher</dt><dd>{result.dataset.publisher}</dd></div><div><dt>Series</dt><dd>{result.dataset.seriesId}</dd></div><div><dt>Frequency</dt><dd>{result.dataset.frequency} / {result.dataset.marketTimestampPolicy}</dd></div><div><dt>Adjustment</dt><dd>{result.dataset.adjustmentPolicy}</dd></div><div><dt>Version</dt><dd>{result.dataset.dataVersion}</dd></div></dl></section><section><h3>Execution assumptions</h3><ul>{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></section></div><section className={styles.tradeSection}><div><p className="eyebrow">TRADE LEDGER</p><h3>Model entries and exits</h3></div><p>Fees {money(metrics.totalFees)} · slippage {money(metrics.totalSlippage)} · average trade {nullable(metrics.averageTrade, money)}</p><div className={styles.tradeTable}><table><thead><tr><th>Side</th><th>Entry</th><th>Exit</th><th>Entry price</th><th>Exit price</th><th>Net PnL</th></tr></thead><tbody>{result.trades.length ? result.trades.map((trade) => <tr key={trade.id}><td>{trade.side}</td><td>{trade.entryTimestamp}</td><td>{trade.exitTimestamp}</td><td>{number(trade.entryPrice, 4)}</td><td>{number(trade.exitPrice, 4)}</td><td>{money(trade.netPnl)}</td></tr>) : <tr><td colSpan={6}>No completed trade occurred under the selected rule and source window.</td></tr>}</tbody></table></div></section><section className={styles.limitations}><h3>Limits that remain visible</h3><ul>{result.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></section></div>; }

function ResearchMode({ blocker, isRunning, onInspect }: { blocker: ResearchBacktestUnavailable | null; isRunning: boolean; onInspect: () => void }) { return <section className={styles.researchMode}><p className="eyebrow">RESEARCH BACKTEST / EVENT REACTION</p><h2>Historical reaction studies are not yet authorized by the data.</h2><p>ForexMax will eventually compare verified historical events with market windows and show sample size, median, range, exceptions and source methodology. It will not present a reaction study while release-time provenance is missing.</p><button type="button" className={styles.runButton} onClick={onInspect} disabled={isRunning}>{isRunning ? "Checking controls…" : "Inspect research-data readiness"}</button>{blocker ? <div className={styles.blocker}><strong>{blocker.code}</strong><p>{blocker.detail}</p><ul>{blocker.requiredProvenance.map((field) => <li key={field}>{field}</li>)}</ul></div> : null}</section>; }

function Metric({ label, value }: { label: string; value: string }) { return <div className={styles.metric}><span>{label}</span><strong>{value}</strong></div>; }
