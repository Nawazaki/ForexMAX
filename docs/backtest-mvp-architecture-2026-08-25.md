# Backtest MVP architecture

## Decision

The initial ForexMax Backtest MVP will run as a **server-side TypeScript engine inside the existing Next.js application**, not as Python in the browser and not as a persistent Python service. This is a deliberate bounded implementation: FRED daily reference-series data can be read, validated and simulated within a normal request for a small approved universe and a maximum five-year window. It does not require a worker, queue, cron, new secret, database write or a long-lived process.

| Option | Use case | Trade-offs | Cost and setup |
|---|---|---|---|
| Request-bounded TypeScript engine — selected MVP | Approved strategy, 1–5 years of daily FRED data, immediate one-off research | Limited universe and strategy set; no intraday, portfolio optimization or persistent history | Uses the current Next.js Preview deployment; no new service or runtime. |
| Isolated Python worker with durable jobs — future | Large intraday datasets, many assets, optimization sweeps or long event studies | Requires approved isolated storage, job state, safe worker limits and a non-browser Python runtime | Additional service/runtime and operating approval required; not enabled in this MVP. |

## Request boundary

```text
Backtest workbench (browser)
  → POST /api/backtests (bounded Zod schema)
  → approved FRED dataset adapter (server only)
  → pure TypeScript simulator
  → typed result payload
  → browser-only visual rendering of returned results
```

The browser never receives a Python interpreter, file path, source URL, strategy expression, shell command or arbitrary dataset. The API accepts only enumerated assets, enumerated strategies, finite numeric parameter ranges, period selection and declared cost assumptions.

## Data provenance contract

Each accepted dataset must return:

| Field | MVP rule |
|---|---|
| Publisher and source URL | Fixed in an approved asset registry. |
| Series identifier | Fixed in the same registry; no caller-provided URL or ID. |
| Reference period | The actual daily FRED observation dates returned in the response. |
| Frequency | Daily source observation. |
| Market timestamp | Date-only reference period; FRED daily graph data does not provide an intraday execution timestamp. |
| Release timestamp | `null` unless the connected publisher provides a release time. |
| Retrieval timestamp | Server timestamp for the fetch. |
| Timezone | `SOURCE_DATE_ONLY`; no intraday timezone inference. |
| Adjustment policy | `AS_PUBLISHED_REFERENCE_SERIES`; not an adjusted total-return or broker-execution feed. |
| Data version / cutoff | Deterministic source-window query plus server-side retrieval timestamp; a future persisted dataset must add immutable versioning. |

## Strategy boundary

The MVP supports the approved `SMA_CROSSOVER` strategy only, with validated fast/slow windows. A signal uses data available **through the preceding valid daily observation** and is model-filled at the next valid FRED daily reference close. It can take one whole exposure: long, flat or short. It is not an order-book simulator.

Costs are declared as fee basis points, slippage basis points and leverage. The engine has no spread feed, borrow cost, financing, tax, corporate-action handling, partial fills, liquidity model, margin call, stop order or intraday market data. Its execution output is therefore labeled a **historical reference-series simulation**, not realistic broker execution.

## No-look-ahead controls

1. Bars must be increasing by reference date and values must be finite and positive.
2. The signal at reference date `t` uses observations ending at `t − 1` only.
3. The simulated fill uses the next valid reference observation at `t`; it does not use the close that formed the signal.
4. The engine returns its effective data range, information cutoff rule, model-fill rule and full assumptions.
5. Research/event mode refuses to run until a verified event dataset declares event timestamp, release timestamp, cutoff, source URL, timezone and data version.

## Governance and access

The Backtest endpoint is public but read-only: it creates no research record, writes no database state and accepts no user code, data file or arbitrary network location. It therefore has no user-specific result history or privileged mutation surface in the MVP. Existing `/admin` session protection continues to guard editorial areas. Persisting a study or publishing a market assessment remains blocked by the existing isolated Preview database requirement and evidence/editorial gates.

## Future Market Forensics contract

The API type surface reserves `RESEARCH_EVENT` mode, but returns a clear blocked status until an approved event dataset exists. When activated, each result must retain event selection definition, sample size, event and market windows, publisher/source URLs, timestamp/timezone fields, data cutoff, version, distribution methodology and exceptions. The system must present median/range/historical outcomes only; it must not convert them into a buy/sell signal or forecast.
