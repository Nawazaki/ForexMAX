# ForexMax Product Audit — Market Intelligence Gap Matrix

**Audit date:** 25 August 2026  
**Codebase assessed:** `migration/nextjs-platform` at `725ab36`  
**Scope:** Repository, local rendered surfaces, current Vercel Preview build metadata, and source contracts. No Production database query, write, migration, deployment setting, or environment-variable change was performed.

## Executive finding

ForexMax already has a credible **source-policy and macro-observation foundation**, but it is not yet a product-level market-intelligence desk. The gap is not primarily visual: it is the absence of a normalized cross-asset observation layer, economic-event records, evidence-linked driver models, and persisted editorial workflow. Today, the product can reliably answer **“what is the latest recorded value for four U.S. macro/fiscal series?”** It cannot yet reliably answer **“what changed across markets, why might it matter, what evidence supports an assessment, and what should a reader watch next?”**

> The next release should therefore build a coherent, source-aware **market tape and event/driver model**, not add unrelated one-off observations or fill empty pages with generic commentary.

## 1. Current information inventory

### A. Financial information available now

The live read-only desk retrieves four official observations with a visible source, reference period, retrieval time, timeout protection, and a 15-minute revalidation target. The Treasury-rate series also retains the last 12 valid observations for a small line chart.

| Observation | Current source path | What is available | Material limitation |
|---|---|---|---|
| U.S. CPI-U | BLS Public Data API series `CUUR0000SA0` | Latest monthly index level and reference period | No event record, prior/forecast/surprise field, or reaction analysis. |
| U.S. unemployment rate | BLS Public Data API series `LNS14000000` | Latest monthly rate and reference period | No release calendar, historical context, or market-impact evidence. |
| U.S. 10-year Treasury rate | FRED series `DGS10` | Latest daily observation plus a 12-point recent series | Not intraday; no real-yield companion, curve, or cross-asset context on the main desk. |
| U.S. total public debt outstanding | Treasury Fiscal Data `Debt to the Penny` | Latest published fiscal-balance record | Not a yield, price, forecast, or market signal. |

The source contracts also catalogue Federal Reserve/FRED, BLS, BEA, Treasury, CFTC, EIA, ECB, Bank of England, Bank of Japan, IMF, World Bank, and OECD. These contracts are **not evidence that the sources are connected or active**.

### B–D. Market coverage and source state

| Coverage area | Meaningful information now | Actually live source data | Documented only / not connected |
|---|---|---|---|
| Macro and rates | Most meaningful public surface: four observations, one rate sparkline, source/retrieval metadata. | BLS, FRED `DGS10`, Treasury Fiscal Data. | BEA, Federal Reserve releases beyond DGS10, central-bank calendars. |
| USD and FX | Research framing and links to central-bank sources. | None. | Federal Reserve H.10/FRED, ECB, BoE, BoJ contracts. |
| Gold and commodities | Source contracts and publication boundaries. | None. | EIA, CFTC and a named price-data contract. |
| Equities and risk | Directory language and governance only. | None. | Exchange/index-provider data, volatility and market-data contracts. |
| Positioning | CFTC source contract only. | None. | Exact COT report family, market mapping, report-date policy. |
| Digital assets | Protocol language only. | None. | A legally reviewed, named data contract. |
| Published research | Legacy article/audit archive can appear publicly. | Database-backed output only when Prisma is configured. | New event/evidence/review workflow is not operational. |

### E–F. Page usefulness assessment

| Page / surface | Product usefulness today | Reason |
|---|---|---|
| `/macro` | **Useful but narrow** | Displays genuine official records with methodology, source, reference period, and retrieval time. |
| `/` | **Useful as a macro landing page** | Reuses the four official observations and published archive, but does not synthesize cross-asset changes or a true market brief. |
| `/sources` | **Useful for transparency** | Good source registry, but a directory is not a data desk. |
| `/markets` and market detail pages | **Useful as coverage disclosure** | Clear boundaries and source contracts; not yet useful for a reader seeking current market context. |
| `/research` | **Useful archive/protocol surface** | Explains standards, but new Market Intelligence records are blocked and the visible feed can be legacy fallback content. |
| `/admin/research` | **Not operational** | Source Manager, event creation, evidence, and editorial actions are disabled; counts are zero until a non-Production recordset is connected. |
| `/api/search` and public search | **Conditional / blocked without database configuration** | Search requires Prisma-backed records; it returns an unavailable state when no database connection exists. |
| `/tools` | **Useful educational utility** | User-input calculators and a session clock, not market intelligence. |

### G–H. What a serious researcher still cannot do

The platform lacks an economic-event dataset, previous/forecast/actual fields, surprise calculation, source-document metadata, driver evidence, market reaction observations, common cross-asset history, asset-level research pages, true current research records, and a durable review queue. It also lacks the common reader workflow of moving from a macro release to affected assets, related observable changes, evidence, historic context, and a clearly bounded editorial conclusion.

Comparable market-information products usually expose an economic calendar with country, importance, previous/consensus/actual fields and market snapshots. ForexMax should not copy their claims or design; it should provide the defensible version of that workflow: official source first, exact time and reference period, evidence links, freshness, and explicit separation of fact from interpretation.

## 2. Gap matrix

| Feature | Current status | Data source | User value | SEO value | Implementation effort | Priority |
|---|---|---|---|---|---|---|
| Cross-asset market tape | Absent; only four macro/fiscal observations. | Existing FRED/BLS/Treasury access patterns; exact series must be approved. | Very high | High | Medium | **P0** |
| Market Brief: what changed / why it matters / watch next | Copy-only framing, no structured evidence model. | Tape observations plus publisher links. | Very high | High | Medium | **P0** |
| Economic-event record model | Absent. | Official release calendars/APIs after per-agency contract review. | Very high | Very high | Medium | **P0** |
| Driver evidence model | Data model concept exists; no operating records or rendering. | Source documents and normalized observations. | Very high | High | High, needs non-Production persistence for full workflow | **P0** |
| Interest-rate and real-yield context | Only DGS10 latest/mini-series. | FRED/Treasury official series. | High | High | Low–medium | **P1** |
| USD, FX, gold, oil, risk observable context | Source contracts only. | Named Federal Reserve/FRED or legally approved official/structured datasets. | High | High | Medium | **P1** |
| Asset research pages | No asset pages; market-directory pages are disclosure only. | Cross-asset tape + evidence records. | High | High only when substantive | Medium–high | **P1** |
| CFTC positioning | Source contract only. | Exact COT report family, market IDs, report dates. | High | High | Medium | **P1** |
| Event reaction study | Absent. | Event records plus timestamped market observations. | High | Very high | High | **P2** |
| Search across research and evidence | Works only with configured Prisma-backed content. | Database index. | Medium–high | Medium | Medium | **P2** |
| Admin Source Manager / Evidence / Review | Read-only, disabled governance shell. | Isolated non-Production database, Auth, RLS. | High for editors | Indirect | High | **P2** |
| Scheduled retrieval and quality checks | No scheduler enabled, by design. | Approved source adapters. | Medium initially; high at scale | Indirect | Medium | **P3 — prepare only** |

## 3. Top ten product gaps

1. There is no coherent cross-asset observation layer spanning rates, USD, gold, FX, equity risk, and energy.
2. The homepage cannot yet state what changed using traceable deltas across a market set.
3. There is no economic-event record with release time, country, institution, reference period, prior, forecast, actual, and source-policy fields.
4. There is no evidence-linked driver engine that can distinguish observed factors, counter-evidence, catalysts, and risks.
5. Rates context lacks real yields and a structured curve/relative-change treatment.
6. Gold, FX, equities, energy, volatility, and positioning have no real public data surface.
7. Asset pages requested for XAUUSD, EURUSD, GBPUSD, USDJPY, DXY, US10Y, SPX, NASDAQ, WTI, and Brent cannot be published without becoming thin or unsourced.
8. The research workflow’s UI exists but it cannot create, validate, review, or publish a real record under the current non-Production constraint.
9. Search and the new research archive remain dependent on a configured database.
10. Freshness, source conflicts, deduplication, normalization, and quality checks are designed but not operating.

## 4. Recommended release boundary after this audit

The highest-value safe release is a **read-only Cross-Asset Intelligence Desk**, not a simulated editorial engine. It should organize approved, attributable observations into a compact market tape and a Market Brief that only states computed, reversible facts: latest observation, prior comparable observation, absolute/percentage change where mathematically valid, source, reference date, retrieval time, and stated limitations. It can group these into rates, dollar, gold, FX, oil, equities, and risk without assigning a directional market bias.

The economic-event and driver schemas should be added as **typed, non-persistent contracts** with fields optional by design. They should render only source-backed values. Full event ingestion, CFTC positioning, research evidence, editorial decisions, and scheduled retrieval remain deferred until a non-Production persistence environment is explicitly approved and connected.

## References

[1]: https://www.bls.gov/developers/ "U.S. Bureau of Labor Statistics — Public Data API"
[2]: https://fred.stlouisfed.org/series/DGS10 "FRED — 10-Year Treasury Constant Maturity Rate"
[3]: https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/debt-to-the-penny "U.S. Treasury Fiscal Data — Debt to the Penny"
[4]: https://www.federalreserve.gov/releases/h10/summary/ "Federal Reserve — Foreign Exchange Rates H.10"
