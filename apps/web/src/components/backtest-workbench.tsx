"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./backtest-workbench.module.css";

type Mode = "STRATEGY" | "RESEARCH_EVENT";
type Asset = "SP500" | "EURUSD" | "USDJPY";

type EngineResult = {
  status: "COMPLETED";
  engine: { name: string; version: string; execution: string; license: string; sourcePreserved: boolean };
  dataset: { provider: string; sourceUrl: string; symbol: string; label: string; frequency: string; referencePeriodStart: string; referencePeriodEnd: string; retrievedAt: string; dataVersion: string; adjustment: string };
  configuration: { asset: Asset; strategy: "SMA_CROSSOVER"; periodYears: number; fastWindow: number; slowWindow: number; positionSize: number; capital: number; fees: number; slippage: number; leverage: number };
  metrics: { portfolioValue: number; portfolioPnlPct: number; maxDrawdownPct: number; feesPaid: number; orders: number; executedTrades: number; closedPositions: number; openPositions: number };
  equityCurve: Array<{ referenceDate: string; portfolioPnlPct: number; portfolioValue: number }>;
  orders: Array<Record<string, string | number | null>>;
  trades: Array<Record<string, string | number | null>>;
  positions: Array<Record<string, string | number | null>>;
  assumptions: string[];
  limitations: string[];
};

type Capabilities = { engine: string; execution: string; strategies: Array<{ id: string; label: string }>; assets: Array<{ id: Asset; label: string; provider: string }>; originalIndicators: string[]; activeIndicators: string[]; researchMode: { status: string; reason: string } };

const assetOptions: Array<{ id: Asset; label: string; detail: string }> = [
  { id: "SP500", label: "S&P 500", detail: "Yahoo Finance daily OHLCV reference series" },
  { id: "EURUSD", label: "EUR/USD", detail: "Yahoo Finance daily OHLCV reference series" },
  { id: "USDJPY", label: "USD/JPY", detail: "Yahoo Finance daily OHLCV reference series" },
];

const number = (value: number, digits = 2) => new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

function EquityCurve({ result }: { result: EngineResult }) {
  const points = useMemo(() => {
    const values = result.equityCurve.map((point) => point.portfolioValue);
    const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1;
    return result.equityCurve.map((point, index) => `${(index / Math.max(1, result.equityCurve.length - 1)) * 100},${92 - ((point.portfolioValue - min) / range) * 80}`).join(" ");
  }, [result]);
  return <figure className={styles.curveFigure}><figcaption><span>Portfolio value curve</span><small>Original AlphaBacktest account value on returned daily reference observations.</small></figcaption><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="AlphaBacktest portfolio value curve"><line x1="0" y1="92" x2="100" y2="92" /><line x1="0" y1="12" x2="0" y2="92" /><polyline points={points} /></svg><div className={styles.curveAxis}><span>{result.dataset.referencePeriodStart}</span><span>{result.dataset.referencePeriodEnd}</span></div></figure>;
}

export function BacktestWorkbench() {
  const [mode, setMode] = useState<Mode>("STRATEGY");
  const [asset, setAsset] = useState<Asset>("SP500");
  const [periodYears, setPeriodYears] = useState(1);
  const [fastWindow, setFastWindow] = useState(20);
  const [slowWindow, setSlowWindow] = useState(60);
  const [positionSize, setPositionSize] = useState(1);
  const [capital, setCapital] = useState(20_000);
  const [feePercent, setFeePercent] = useState(0.005);
  const [slippagePercent, setSlippagePercent] = useState(0.01);
  const [leverage, setLeverage] = useState(1);
  const [result, setResult] = useState<EngineResult | null>(null);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function runStrategy() {
    setError(null); setResult(null); setCapabilities(null); setIsRunning(true);
    try {
      const response = await fetch("/api/alphabacktest", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ asset, strategy: "SMA_CROSSOVER", periodYears, fastWindow, slowWindow, positionSize, capital, fees: feePercent / 100, slippage: slippagePercent / 100, leverage }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "AlphaBacktest request could not be completed.");
      setResult(body as EngineResult);
    } catch (runError) { setError(runError instanceof Error ? runError.message : "AlphaBacktest request could not be completed."); }
    finally { setIsRunning(false); }
  }

  async function inspectResearchMode() {
    setError(null); setResult(null); setIsRunning(true);
    try {
      const response = await fetch("/api/alphabacktest", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "AlphaBacktest capabilities could not be retrieved.");
      setCapabilities(body as Capabilities);
    } catch (runError) { setError(runError instanceof Error ? runError.message : "Research-mode status could not be retrieved."); }
    finally { setIsRunning(false); }
  }

  return <>
    <section className="shell page-intro"><p className="eyebrow">ALPHABACKTEST / PYTHON ENGINE / PREVIEW</p><h1>Preserved engine, bounded research interface.</h1><p>This lab calls the original AlphaBacktest Python Account → Portfolio → Trader → Broker → Engine flow behind a constrained API. It is historical research infrastructure, not personalized financial advice or a signal service.</p></section>
    <section className={`shell ${styles.workbench}`}>
      <div className={styles.modeBar} role="tablist" aria-label="Backtest mode"><button type="button" className={mode === "STRATEGY" ? styles.activeMode : ""} onClick={() => { setMode("STRATEGY"); setCapabilities(null); }}>Strategy Backtest</button><button type="button" className={mode === "RESEARCH_EVENT" ? styles.activeMode : ""} onClick={() => { setMode("RESEARCH_EVENT"); setResult(null); }}>Research Backtest</button><p>Python server-side · no file upload · no user code</p></div>
      {mode === "STRATEGY" ? <div className={styles.grid}>
        <aside className={styles.controls}><div><p className="eyebrow">DEFINED ORIGINAL-ENGINE INPUTS</p><h2>Run a constrained strategy wrapper.</h2><p className={styles.muted}>The source engine is preserved. The only enabled wrapper strategy is SMA crossover; it places the original engine&apos;s delayed orders and uses its broker, leverage, fee, slippage, portfolio and PnL logic.</p></div>
          <label>Asset<select value={asset} onChange={(event) => setAsset(event.target.value as Asset)}>{assetOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <p className={styles.inputHint}>{assetOptions.find((option) => option.id === asset)?.detail} · Provider is explicit in every result.</p>
          <div className={styles.twoCol}><label>Historical window<select value={periodYears} onChange={(event) => setPeriodYears(Number(event.target.value))}><option value={1}>1 year</option><option value={3}>3 years</option><option value={5}>5 years</option></select></label><label>Leverage<input type="number" min="1" max="20" step="0.25" value={leverage} onChange={(event) => setLeverage(Number(event.target.value))} /></label></div>
          <div className={styles.twoCol}><label>Fast SMA<input type="number" min="2" max="100" value={fastWindow} onChange={(event) => setFastWindow(Number(event.target.value))} /></label><label>Slow SMA<input type="number" min="5" max="250" value={slowWindow} onChange={(event) => setSlowWindow(Number(event.target.value))} /></label></div>
          <div className={styles.twoCol}><label>Position size<input type="number" min="1" max="10000" value={positionSize} onChange={(event) => setPositionSize(Number(event.target.value))} /></label><label>Initial capital (USD)<input type="number" min="1000" max="10000000" step="1000" value={capital} onChange={(event) => setCapital(Number(event.target.value))} /></label></div>
          <div className={styles.twoCol}><label>Commission (%)<input type="number" min="0" max="10" step="0.001" value={feePercent} onChange={(event) => setFeePercent(Number(event.target.value))} /></label><label>Slippage (%)<input type="number" min="0" max="10" step="0.001" value={slippagePercent} onChange={(event) => setSlippagePercent(Number(event.target.value))} /></label></div>
          <button type="button" className={styles.runButton} onClick={runStrategy} disabled={isRunning || fastWindow >= slowWindow}>{isRunning ? "Running preserved Python engine…" : "Run AlphaBacktest"}</button>
          {fastWindow >= slowWindow ? <p className={styles.error}>Fast SMA must be smaller than slow SMA.</p> : null}
        </aside>
        <section className={styles.results} aria-live="polite">{error ? <div className={styles.errorPanel}><strong>Request not completed.</strong><p>{error}</p></div> : null}{result ? <StrategyResult result={result} /> : <ResultEmpty />}</section>
      </div> : <ResearchMode capabilities={capabilities} isRunning={isRunning} onInspect={inspectResearchMode} error={error} />}
    </section>
    <section className={`shell ${styles.forensics}`}><p className="eyebrow">MARKET FORENSICS</p><div><h2>Event studies will wrap the same engine.</h2><p>Future CPI, FOMC, NFP and central-bank studies will require verified event time, release time, information cutoff, data version, source URL and timezone. ForexMax will pass those datasets to a wrapper; it will not edit the AlphaBacktest engine or fabricate a reaction study.</p></div><Link href="/methodology">Read the evidence methodology →</Link></section>
  </>;
}

function ResultEmpty() { return <div className={styles.emptyResult}><p className="eyebrow">AWAITING A DEFINED RUN</p><h2>The original engine is the execution path.</h2><p>Choose an allowlisted asset and bounded inputs. ForexMax sends those values to the Python AlphaBacktest service, which first attempts the source project&apos;s Yahoo data reader and reports any compatibility fallback explicitly.</p><dl><div><dt>Preserved source</dt><dd>AlphaBacktest 1.0.0 Account, Portfolio, Trader, Broker and Engine classes.</dd></div><div><dt>Provider boundary</dt><dd>Yahoo Finance daily OHLCV; this is historical reference data, not live pricing.</dd></div><div><dt>Gold boundary</dt><dd>Gold remains excluded until an eligible historical price-source contract is connected.</dd></div></dl></div>; }

function StrategyResult({ result }: { result: EngineResult }) { const { metrics } = result; return <div className={styles.resultBody}><div className={styles.resultHeader}><div><p className="eyebrow">COMPLETED / ORIGINAL PYTHON ENGINE</p><h2>{result.dataset.label} · {result.configuration.strategy}</h2><p>{result.dataset.referencePeriodStart} to {result.dataset.referencePeriodEnd} · retrieved {new Date(result.dataset.retrievedAt).toLocaleString("en-GB", { timeZone: "UTC", timeZoneName: "short" })}</p></div><a href={result.dataset.sourceUrl} target="_blank" rel="noreferrer">Open provider ↗</a></div><div className={styles.metricGrid}><Metric label="Portfolio value" value={money(metrics.portfolioValue)} /><Metric label="Portfolio PnL" value={`${number(metrics.portfolioPnlPct)}%`} /><Metric label="Max drawdown" value={`${number(metrics.maxDrawdownPct)}%`} /><Metric label="Fees paid" value={money(metrics.feesPaid)} /><Metric label="Orders" value={String(metrics.orders)} /><Metric label="Executed trades" value={String(metrics.executedTrades)} /><Metric label="Closed positions" value={String(metrics.closedPositions)} /><Metric label="Open positions" value={String(metrics.openPositions)} /></div><EquityCurve result={result} /><div className={styles.detailGrid}><section><h3>Engine and data provenance</h3><dl><div><dt>Engine</dt><dd>{result.engine.name} {result.engine.version} · {result.engine.execution}</dd></div><div><dt>Provider</dt><dd>{result.dataset.provider}</dd></div><div><dt>Symbol</dt><dd>{result.dataset.symbol}</dd></div><div><dt>Frequency</dt><dd>{result.dataset.frequency}</dd></div><div><dt>Adjustment</dt><dd>{result.dataset.adjustment}</dd></div><div><dt>Version</dt><dd>{result.dataset.dataVersion}</dd></div></dl></section><section><h3>Original-engine assumptions</h3><ul>{result.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul></section></div><Ledger heading="TRADE LEDGER" title="Original broker trade records" rows={result.trades} columns={["Security", "Type", "Datetime", "Price", "Amount"]} empty="No executed trade was recorded for this run." /><Ledger heading="POSITION LEDGER" title="Original Portfolio entries and exits" rows={result.positions} columns={["Security", "ODate", "OPrice", "CDate", "CPrice", "Amount", "PNL", "Performance"]} empty="No position record was returned for this run." /><section className={styles.limitations}><h3>Limits that remain visible</h3><ul>{result.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></section></div>; }

function Ledger({ heading, title, rows, columns, empty }: { heading: string; title: string; rows: Array<Record<string, string | number | null>>; columns: string[]; empty: string }) { return <section className={styles.tradeSection}><div><p className="eyebrow">{heading}</p><h3>{title}</h3></div><div className={styles.tradeTable}><table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={String(row.id)}>{columns.map((column) => <td key={column}>{row[column] ?? "—"}</td>)}</tr>) : <tr><td colSpan={columns.length}>{empty}</td></tr>}</tbody></table></div></section>; }

function ResearchMode({ capabilities, isRunning, onInspect, error }: { capabilities: Capabilities | null; isRunning: boolean; onInspect: () => void; error: string | null }) { return <section className={styles.researchMode}><p className="eyebrow">RESEARCH BACKTEST / EVENT REACTION</p><h2>Historical reaction work has a provenance gate.</h2><p>The same AlphaBacktest Python engine will be available through a wrapper when a verified event dataset exists. ForexMax will not create reaction statistics from a chart alone.</p><button type="button" className={styles.runButton} onClick={onInspect} disabled={isRunning}>{isRunning ? "Checking Python service…" : "Inspect engine and research readiness"}</button>{error ? <p className={styles.error}>{error}</p> : null}{capabilities ? <div className={styles.blocker}><strong>{capabilities.researchMode.status}</strong><p>{capabilities.researchMode.reason}</p><p>Original source indicators: {capabilities.originalIndicators.join(", ")}. Active serverless indicators: {capabilities.activeIndicators.length ? capabilities.activeIndicators.join(", ") : "none until TA-Lib compatibility is verified"}.</p></div> : null}</section>; }

function Metric({ label, value }: { label: string; value: string }) { return <div className={styles.metric}><span>{label}</span><strong>{value}</strong></div>; }
