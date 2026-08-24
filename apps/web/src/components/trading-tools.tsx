"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { calculatePositionSize, calculateRiskReward, formatUtcClock } from "@/lib/trading-calculations";

export function TradingTools() {
  const [balance, setBalance] = useState("10000");
  const [risk, setRisk] = useState("1");
  const [stopPips, setStopPips] = useState("25");
  const [pipValue, setPipValue] = useState("0.0001");
  const [entry, setEntry] = useState("1.1000");
  const [stop, setStop] = useState("1.0950");
  const [target, setTarget] = useState("1.1100");
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  const position = useMemo(() => calculatePositionSize(balance, risk, stopPips, pipValue), [balance, risk, stopPips, pipValue]);
  const reward = useMemo(() => calculateRiskReward(entry, stop, target), [entry, stop, target]);
  const f = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => setter(event.target.value);
  return <div className="tools-grid"><section className="tool-card"><p className="eyebrow">POSITION SIZE</p><h2>Define the trade before the risk.</h2><div className="field-grid"><label>Account balance<input inputMode="decimal" value={balance} onChange={f(setBalance)} /></label><label>Risk %<input inputMode="decimal" value={risk} onChange={f(setRisk)} /></label><label>Stop (pips)<input inputMode="decimal" value={stopPips} onChange={f(setStopPips)} /></label><label>Pip value / unit<input inputMode="decimal" value={pipValue} onChange={f(setPipValue)} /></label></div><output>Risk: <strong>${position.money.toFixed(2)}</strong><br />Approx. units: <strong>{Math.round(position.units).toLocaleString()}</strong></output></section><section className="tool-card"><p className="eyebrow">RISK / REWARD</p><h2>Check asymmetry before entry.</h2><div className="field-grid"><label>Entry<input value={entry} onChange={f(setEntry)} /></label><label>Stop<input value={stop} onChange={f(setStop)} /></label><label>Target<input value={target} onChange={f(setTarget)} /></label></div><output>Risk / reward: <strong>1:{reward.ratio.toFixed(2)}</strong><br />Break-even before costs: <strong>{reward.breakEvenPercent.toFixed(1)}%</strong></output></section><section className="tool-card session-clock"><p className="eyebrow">SESSION CLOCK</p><h2>Use time as context, not a signal.</h2><time suppressHydrationWarning dateTime={now.toISOString()}>{formatUtcClock(now)}</time><p>Session labels are indicative. Verify holidays, daylight saving and provider-specific trading hours.</p></section></div>;
}
