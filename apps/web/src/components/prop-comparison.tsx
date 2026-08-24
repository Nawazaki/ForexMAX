"use client";

import { useMemo, useState } from "react";
import type { PropFirmRecord } from "@/lib/prop-firms";

export function PropComparison({ firms }: { firms: PropFirmRecord[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => firms.filter((firm) => `${firm.name} ${firm.platform} ${firm.evaluationType}`.toLowerCase().includes(query.toLowerCase())), [firms, query]);
  return <section className="comparison-wrap" aria-label="Prop firm comparison">
    <div className="toolbar"><label>Search firms<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search firm or platform" /></label><span>{visible.length} firms · research assessment, not a regulatory rating</span></div>
    <div className="table-scroll"><table><thead><tr><th>Firm</th><th>Fee</th><th>Split</th><th>Drawdown</th><th>Platform</th><th>Assessment</th><th>Reviewed</th></tr></thead><tbody>{visible.map((firm) => <tr key={firm.slug}><td><strong>{firm.name}</strong><small>{firm.evaluationType}</small></td><td>{firm.challengeFee}</td><td>{firm.profitSplit}</td><td>{firm.maximumDrawdown}<small>Daily: {firm.dailyDrawdown}</small></td><td>{firm.platform}</td><td><span className="status-pill">{firm.assessment}</span></td><td>{firm.lastReviewed}</td></tr>)}</tbody></table></div>
  </section>;
}
