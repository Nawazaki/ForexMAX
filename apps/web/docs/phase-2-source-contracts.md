# Phase 2 source contracts

## Purpose

The first Phase 2 public increment replaces a large availability-first homepage surface with a compact, source-backed macro desk. It is deliberately a read-only presentation layer. It does not write to the shared Supabase database, create research events, calculate a market bias, or publish an assessment.

## Initial data contracts

| Module | Official publisher | Observation | Public retrieval endpoint | Public fields shown | Public interpretation rule |
|---|---|---|---|---|---|
| Consumer prices | U.S. Bureau of Labor Statistics | CPI-U, all items, U.S. city average | `https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0?latest=true` | Index level and reference month | Display as the latest BLS observation only; do not infer inflation direction or market impact. |
| Labour market | U.S. Bureau of Labor Statistics | Civilian unemployment rate | `https://api.bls.gov/publicAPI/v2/timeseries/data/LNS14000000?latest=true` | Rate and reference month | Display as the latest BLS observation only; do not infer employment momentum or policy implications. |
| Rates context | Federal Reserve Bank of St. Louis / FRED | 10-year Treasury constant-maturity rate | `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10` | Recent daily observations and latest available observation date | Display as a source-labelled historical series. It is not a real-time quote, forecast, or trading signal. |

The BLS Public Data API documents a latest-series endpoint and returns an explicit period, value, and footnotes. The Treasury fiscal-data API is open and needs no account or token, but is not yet wired into the first public module because an exact, reviewed market-use endpoint has not been selected. FRED's documented API requires a registered key; the initial public module therefore uses the official FRED graph CSV endpoint only for the published DGS10 historical series and makes the source URL visible to users.

## Presentation and freshness

1. Every displayed observation carries its publisher, source URL, reference period, and retrieval timestamp.
2. A network failure removes only the affected row and shows a compact source-status notice. It does not replace the page with invented numbers, cached figures with unknown vintage, or repeated "data unavailable" panels.
3. The UI labels the macro panel as an **official-data snapshot** rather than a live market feed. No price, probability, market call, or causal market-reaction claim is generated from the values.
4. Requests are server-side, bounded by a timeout, and have no client-side secret or API key.

## Pipeline boundary

The target pipeline remains:

`source → fetch → normalize → deduplicate → classify → store → verify → link to asset → create research event → review → publish`

The source, event, evidence, quality, review, and job tables were prepared in migration `20260824_004_market_intelligence_foundation.sql`. That migration has **not** been applied because the available Supabase database is shared with the current live environment. Persistent collection, retry queues, stored evidence, or a scheduled fetcher must wait for a safe Preview database target and an explicit automation/hosting decision.

## Local visual validation

On 25 August 2026, the local Phase 2 preview was reviewed at `/` and `/macro` using live responses from the defined BLS and FRED source contracts. The homepage showed a compact official-observation strip, source links, retrieval time, a rate-series visualization, and the published research feed without turning missing asset feeds into dominant content. The Macro page showed the source-labelled table, reference periods, retrieval time, rate context, and evidence protocol.

The responsive layouts were then captured at 390px (`/`) and 430px (`/macro`). Both checks reported no horizontal document overflow. The homepage stacked the official observations, rate panel, research feed, and source rail into readable modules; the Macro page retained an intentionally horizontally scrollable data table while keeping the surrounding content legible.

## Preview validation record

The Phase 2 Vercel Preview for commit `75e1d62` returned `HTTP 200` for `/macro` on 25 August 2026. Its canonical URL was `https://www.forexmax.com/macro`; Vercel applies `noindex` to the protected Preview response while the page metadata retains `index, follow` for the eventual approved canonical deployment.

At retrieval time, the Preview rendered these source-labelled observations: BLS CPI-U index `333.918` for July 2026; BLS civilian unemployment rate `4.1%` for July 2026; and FRED DGS10 `4.74%` for 21 August 2026. These values are a validation record, not a persistent database snapshot or an assessment.

## Read-only research control preparation

The public source directory now contains source contracts for the Federal Reserve/FRED, BLS, BEA, U.S. Treasury Fiscal Data, CFTC, EIA, ECB, Bank of England, BOJ, IMF, World Bank, and OECD. Each record exposes an official URL, an access type, coverage boundary, and an activation requirement. It is not a statement that the source is actively fetched or that its data is available in the application.

The Research Desk and the authenticated Research Control Center were visually reviewed locally on 25 August 2026. The public desk presents existing published records alongside a publication boundary. The control center labels every persistence-dependent operation as blocked by `PREVIEW_DATABASE_REQUIRED`; it holds no example sources, events, evidence records, assessments, or editorial reviews in place of a Preview database.

Mobile captures at 390px (`/research`) and 430px (`/sources`) confirmed that neither page had horizontal document overflow. The Research Desk stacks its methodology, archive, and publication-boundary sections. The source directory stacks the 12 official source contracts and their activation gates without reducing them to untraceable abbreviations.

## Source references

1. [BLS Public Data API v2](https://www.bls.gov/developers/api_signature_v2.htm)
2. [FRED series observations](https://fred.stlouisfed.org/docs/api/fred/series_observations.html)
3. [BEA Data API](https://apps.bea.gov/api/signup/)
4. [U.S. Treasury Fiscal Data API](https://fiscaldata.treasury.gov/api-documentation/)
5. [CFTC Public Reporting API guidance](https://publicreporting.cftc.gov/stories/s/User-s-Guide/p2fg-u73y/)
6. [EIA Open Data](https://www.eia.gov/opendata/)
7. [ECB Data Portal API](https://data.ecb.europa.eu/help/api/overview)
8. [Bank of England Database](https://www.bankofengland.co.uk/boeapps/database/)
9. [BOJ Time-Series Data Search API guidance](https://www.stat-search.boj.or.jp/info/nme_aphelp_en.html)
10. [IMF Data APIs](https://data.imf.org/en/Resource-Pages/IMF-API)
11. [World Bank Open Data](https://data.worldbank.org/)
12. [OECD Data API](https://www.oecd.org/en/data/insights/data-explainers/2024/09/api.html)
3. [U.S. Treasury Fiscal Data API documentation](https://fiscaldata.treasury.gov/api-documentation/)
