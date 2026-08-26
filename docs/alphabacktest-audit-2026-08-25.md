# AlphaBacktest audit and reuse decision

**Scope:** inspection-only review of user-supplied `alphabacktest-main.zip`, completed on 25 August 2026. No code, dependency or credential from the archive has been executed, installed, copied into ForexMax, or deployed.

## Decision

**Do not integrate AlphaBacktest as a production engine.** The package may inform the product vocabulary—next-observation execution, a trade ledger, explicit costs and result metrics—but its implementation and Dash interface will be replaced by a bounded, server-side, TypeScript-first engine that fits the existing Next.js service boundary. This avoids running Python in the browser and does not accept user-provided code or files.

| Audit area | Finding | Decision |
|---|---|---|
| Status | README explicitly labels the package **DEPRECATED**. | Do not use as a runtime dependency. |
| Language/runtime | Python >=3.6; CI covers 3.6–3.8; old pip/tox/Travis tooling. | Do not adopt its runtime/toolchain. |
| Architecture | Inheritance chain `Account → Portfolio → Trader → Broker → Engine`; user subclasses `strategy()`. | Reuse no implementation; keep only the separation of ledger, execution assumptions and metrics as a conceptual model. |
| Data ingestion | `pandas_datareader` Yahoo pull or local CSV path; no source, timezone, frequency, adjustment, retrieval-time or version contract. | Replace with approved, server-owned dataset adapters and explicit dataset provenance. |
| Execution | Orders are queued and filled at a later bar open; supports simple long/short, slippage, fees and leverage. No partial-fill or liquidity model. | Rebuild a constrained order model. Do not call it realistic execution. |
| Indicators | Optional TA-Lib SMA/EMA/RSI/Bollinger/MACD. | Do not bring in TA-Lib or old indicator code. Start with approved, transparent TypeScript calculations only. |
| Result calculation | Writes CSV files to local disk, starts a separate Dash app, and uses simplified Sharpe/drawdown/trade metrics. | Replace with typed API payloads, an in-app chart, tested formulas and no local result directories. |
| Tests | One placeholder plus a CLI smoke test; no coverage for PnL, costs, execution, drawdown, event windows or look-ahead. | Do not rely on existing test suite. Add regression tests before any product use. |
| Deprecated APIs | Repeated `pandas.DataFrame.append`, obsolete Dash package imports, old `pandas_datareader` route, Python 3.6-era tooling. | Not compatible with a modern production dependency set. |
| Security | No shell, `eval`, `exec`, pickle or network-execution primitive found in source. However, the subclass strategy model permits arbitrary Python by design; local file inputs and result saving/deletion are unsuitable for a public service. A legacy encrypted CI deployment credential artifact is present in the repository configuration and must never be copied or activated. | Do not expose file/code execution or reuse CI configuration. |

## License

The included `LICENSE` is **MIT** (copyright 2021 `serginc21`). It permits reuse, modification and distribution provided the copyright and permission notice remain with substantial copied portions. ForexMax is intentionally not copying substantive AlphaBacktest code; if a future contribution does, the required MIT notice must be preserved and legal review should confirm the attribution placement.

## Compatibility result

The archive is **not suitable as a direct foundation** for ForexMax. It is nevertheless useful as a historical reference for the minimum result surface: orders, trades, positions, equity history, fees, slippage and summary statistics. No proprietary source data is included in the archive.

## Modern integration boundary

The initial Preview MVP will use this bounded flow:

```text
Next.js research UI
  → authenticated/validated Backtest API
  → approved strategy and parameter schema
  → server-side TypeScript engine
  → approved historical-data adapter with provenance
  → typed result payload (equity, drawdown, trades, metrics, assumptions)
```

The first service remains request-bounded and daily-data-only. It has no scheduler, worker, polling loop, arbitrary Python execution, file upload, auto-publication or persistence. A separate Python worker/service and a durable job queue are future options only if an approved workload exceeds the request boundary and an isolated storage/runtime design is approved.

## Research and event-study boundary

`Research Backtest` and `Market Forensics` are separate from strategy simulation. Their contracts require an approved event dataset with event timestamp, release timestamp, reference period, source URL, timezone, retrieval timestamp, information cutoff and dataset version. No CPI/FOMC/NFP reaction distribution will be displayed until such a source contract exists; no historical event series is fabricated from this audit.

## References

- User-supplied AlphaBacktest archive, SHA-256 `7762a51423572ac8a459528ea1fa04f777889b2c927743b93c64d7eda346f8cf`.
- `docs/README.md`, `setup.py`, `LICENSE`, `alphabacktest/alphabacktest.py`, `alphabacktest/cli.py`, `tests/test_alphabacktest.py` from the inspected archive.
