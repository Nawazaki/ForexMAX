"use client";

import Link from "next/link";
import { useState } from "react";

type SearchResult = { type: string; title: string; href: string; description: string };
export function SearchExperience() {
  const [query, setQuery] = useState(""); const [type, setType] = useState("all"); const [results, setResults] = useState<SearchResult[]>([]); const [message, setMessage] = useState("Enter at least two characters to search published research."); const [busy, setBusy] = useState(false);
  async function submit() { if (query.trim().length < 2) { setMessage("Enter at least two characters to search."); setResults([]); return; } setBusy(true); const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`); const body = await response.json().catch(() => ({})); if (!response.ok) { setResults([]); setMessage(body.error ?? "Search could not be completed."); setBusy(false); return; } setResults(body.results as SearchResult[]); setMessage(`${body.results.length} results found.`); setBusy(false); }
  return <section className="search-panel"><form className="search-controls" onSubmit={(event) => { event.preventDefault(); void submit(); }}><label>Search research<input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles, audits and firms" /></label><label>Type<select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All content</option><option value="article">Articles</option><option value="audit">Audits</option><option value="prop-firm">Prop firms</option></select></label><button className="button button-primary" disabled={busy}>{busy ? "Searching…" : "Search"}</button></form><p className="muted" role="status">{message} Search pages are noindex; results are a site utility, not a destination for search engines.</p><div className="search-results">{results.map((record) => <article key={`${record.type}-${record.href}-${record.title}`}><p className="eyebrow">{record.type}</p><h2><Link href={record.href}>{record.title}</Link></h2><p>{record.description}</p></article>)}</div></section>;
}
