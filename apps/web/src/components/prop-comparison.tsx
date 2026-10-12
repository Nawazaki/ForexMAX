"use client";

import { useMemo, useState } from "react";
import { excludedComparisonProviders, type PropFirmRecord } from "@/lib/prop-firms";

export function PropComparison({ firms }: { firms: PropFirmRecord[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => firms.filter((firm) => `${firm.name} ${firm.platform} ${firm.evaluationType}`.toLowerCase().includes(query.toLowerCase())), [firms, query]);
  return <section className="comparison-wrap" aria-label="Prop firm comparison">
    <div className="toolbar"><label>Search firms<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search firm or platform" /></label><span>{visible.length} providers · research assessment, not a regulatory rating</span></div>
    <p>Terms can change and may vary by program, account size, purchase date, country, or contract. “Not verified” means ForexMax did not confirm the current term from a relevant official source; it is not an estimate. Verify the linked terms for your selected program before relying on a condition.</p>
    <div className="table-scroll"><table><thead><tr><th>Firm</th><th>Program / scope</th><th>Entry fee</th><th>Profit split / reward</th><th>Drawdown</th><th>Payout</th><th>Platforms / other rules</th><th>Review status</th><th>Verified</th><th>Official sources</th></tr></thead><tbody>{visible.map((firm) => <tr key={firm.slug}><td><strong>{firm.name}</strong></td><td>{firm.evaluationType}</td><td>{firm.challengeFee}</td><td>{firm.profitSplit}</td><td>{firm.maximumDrawdown}<small>Daily: {firm.dailyDrawdown}</small></td><td>{firm.payout}</td><td><small>Platform: {firm.platform}</small><small>Consistency: {firm.consistency}</small><small>News: {firm.newsTrading} · Weekend: {firm.weekendHolding}</small><small>EA: {firm.expertAdvisor} · Scaling: {firm.scaling}</small></td><td><span className="status-pill">{firm.assessment}</span></td><td>{firm.lastReviewed}</td><td><ul>{firm.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul></td></tr>)}</tbody></table></div>
    <h2>Excluded pending verification</h2>
    <ul>{excludedComparisonProviders.map((provider) => <li key={provider.name}><strong>{provider.name}</strong>: {provider.reason} {provider.lastReviewed}. {provider.sources.map((source, index) => <span key={source.url}>{index > 0 ? "; " : ""}<a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></span>)}</li>)}</ul>
  </section>;
}
