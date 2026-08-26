# AlphaBacktest fidelity report

## Scope

This report records the Preview-only compatibility check between the preserved user-provided **AlphaBacktest 1.0.0** Python source and the ForexMax Python wrapper. It is an engineering fidelity record, not performance research or a trading recommendation.

## Source integrity and license

| Item | Verified result |
|---|---|
| Preserved engine | `apps/web/alphabacktest_py/vendor/alphabacktest.py` |
| Original engine SHA-256 | `84826d5aa7604e5c37e5d26c7ebe990cfafae33cda8a041027ebfdf789da426e` |
| Vendored engine SHA-256 | `84826d5aa7604e5c37e5d26c7ebe990cfafae33cda8a041027ebfdf789da426e` |
| Modification of preserved engine | None; compatibility behavior is in `alphabacktest_py/compat.py` and wrappers are separate files. |
| License retained | MIT source text is retained at `apps/web/alphabacktest_py/vendor/LICENSE`. |

The preserved engine classes are called directly. The wrapper subclasses the original public `Backtest` API for the one allowlisted strategy. It does not reproduce Account, Portfolio, Trader, Broker or Engine calculations in TypeScript.

## Dataset and provider check

The original `pandas_datareader.get_data_yahoo` route was attempted first and failed because its legacy Yahoo parser could not extract the current response payload. The `YahooProvider` then used the disclosed `yfinance` compatibility fallback, retaining Yahoo as the underlying provider and serializing the actual route used.

| Asset | Yahoo symbol | Returned observations | Test reference start | Returned reference end | Data route |
|---|---:|---:|---|---|---|
| S&P 500 | `^GSPC` | 1,005 | 2025-08-25 | 2026-08-25 | yfinance compatibility fallback |
| EUR/USD | `EURUSD=X` | 1,042 | 2025-08-25 | 2026-08-26 | yfinance compatibility fallback |
| USD/JPY | `JPY=X` | 1,042 | 2025-08-25 | 2026-08-26 | yfinance compatibility fallback |

The results are daily historical reference observations. They are not live or executable broker quotes. `yfinance` describes itself as an independent open-source library using publicly available Yahoo interfaces and intended for research and educational purposes; it refers users to Yahoo terms and calls the API personal-use oriented. Therefore the fallback is limited to protected Preview research and is not a Production market-data approval.[1]

## Original versus integrated regression

The regression harness ran a direct subclass of the preserved original `Backtest` API and `SmaCrossoverBacktest`, the ForexMax wrapper, on the **same returned S&P 500 OHLCV dataframe**, exact strategy inputs and deterministic random seed.

| Check | Result |
|---|---|
| Strategy | SMA crossover, 20/60 windows, 1 position unit |
| Original engine settings | Capital `20,000`, fees `0.00005`, slippage `0.0001`, leverage `1.0` |
| Dataset version | `YAHOO:^GSPC:2022-08-23:2026-08-25` |
| Compared records | Orders, trades, closed positions, PnL history, portfolio value and paid fees |
| Tolerance | `1e-9` for numeric fields; exact string equality otherwise |
| Result | `MATCHED` |
| Orders / trades / closed positions | `5` / `5` / `2` |
| Final original portfolio value | `20568.379700042853` |
| Original paid fees | `1.7160815001171876` |

The original engine includes 500-observation warm-up handling, delayed following-period order execution, its own account/portfolio state, fees, leverage, slippage, trade book and position book. The wrapper preserves those operations and serializes their outputs. It only supplies a constrained `strategy()` subclass, pandas `append` compatibility and disabled progress rendering.

## Security and product boundaries

The HTTP function accepts exact allowlisted JSON fields only: asset, strategy, period, SMA windows, position size, capital, fees, slippage and leverage. It rejects uploaded code, Python expressions, local paths, URLs, arbitrary strategies and extra fields. It writes no result files, has no durable run record, does not run a queue, cron, polling process or automatic publication, and exposes no trading endpoint.

Optional TA-Lib indicators remain in the preserved source but no serverless indicator is activated. Research event studies are blocked pending a verified event dataset with timestamp, timezone, release time, data version and information-cutoff provenance.

## References

[1] [yfinance README — Yahoo usage and research disclaimer](https://github.com/ranaroussi/yfinance)

[2] [Vercel — Using the Python Runtime with Vercel Functions](https://vercel.com/docs/functions/runtimes/python)

[3] [Vercel — Python Functions in the `/api` Directory](https://vercel.com/docs/functions/runtimes/python/api-directory)
