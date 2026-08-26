# AlphaBacktest Python integration decision

## Objective

Replace the prior TypeScript-only Backtest MVP as the execution path with the original **AlphaBacktest 1.0.0** Python engine. The original Python source must remain identifiable and substantially unchanged; ForexMax provides a narrow compatibility layer, a constrained HTTP wrapper and a Next.js presentation layer around it.

## Source and license

The imported source is the user-provided `alphabacktest-main.zip`: `alphabacktest/alphabacktest.py` and `alphabacktest/__init__.py`, version `1.0.0`, author Sergi Novellas. It carries the MIT license. The vendored copy will retain the copyright notice and license text.

The original project has no concrete strategy classes beyond the overridable `Backtest.strategy()` callback. It does contain the Account, Portfolio, Trader, Broker and Engine classes; order methods; delayed broker execution; leverage, commission and slippage handling; result dataframes; and optional TA-Lib indicators (`RSI`, `BBANDS`, `MACD`, `EMA`, `SMA`). The original CLI is a placeholder and no original unit test covers trading behavior.

## Hosting decision

| Approach | Outcome | Trade-off | Decision |
|---|---|---|---|
| Python function deployed beside the existing Next.js app | A dedicated Python runtime handles `/api/alphabacktest`; the browser never runs Python and the Next.js UI calls the same origin. | Request-scoped execution, cold starts and a bounded data window; no durable queue. | **Chosen for Preview MVP.** |
| Separately hosted always-on Python API with a queue | A long-running FastAPI service could support very large runs, queued jobs and larger datasets. | A separate hosting decision, cost and operations are required; it adds complexity before run duration proves necessary. | Deferred. |

Vercel documents that file-based Python functions in a root `/api` directory can run alongside another framework and that Python dependencies are declared in `requirements.txt`. The integration will use a root-level Python function in `apps/web/api/`, not `app/api/`, so it does not conflict with Next.js App Router routes. It is a dedicated backend runtime but not an always-on service.

## Compatibility boundary

The original engine calls `DataFrame.append`, which is unavailable in current pandas versions. The wrapper will apply a narrowly scoped pandas compatibility shim before importing the preserved source; it converts the legacy append operation to equivalent `concat` behavior. The wrapper will also suppress only the progress display, which has no effect on the engine's period loop.

The original optional indicators depend on TA-Lib, a native dependency absent from the original required dependency list. They will remain in the preserved source but will not be enabled by the initial serverless strategy wrapper until an explicit Python 3.12 / Vercel compatibility test succeeds. The UI will not claim that any TA-Lib indicator is available beforehand.

## Data and execution controls

The original project uses `pandas_datareader.get_data_yahoo`; therefore the initial `YahooProvider` preserves that path instead of substituting FRED or a TypeScript data source. The current Yahoo response failed in the original `pandas_datareader` parser during local validation, so the provider transparently falls back to `yfinance` only when the original reader fails. The response identifies which route supplied the data. `yfinance` itself states that it is not affiliated with Yahoo, uses publicly available Yahoo interfaces and is intended for research and educational purposes; it points users to Yahoo terms and describes the API as intended for personal use. Accordingly this provider is **Preview research only** and is not a production data-source approval.

A provider interface makes later sources additive. Provider, symbol, URL, frequency, returned start/end reference dates and retrieval timestamp are serialized with each response. The UI calls this data **daily historical reference data**, not live prices.

The public endpoint accepts only an allowlisted provider, asset, strategy identifier and bounded numeric parameters. It accepts no uploaded scripts, Python expressions, arbitrary URLs, shell commands, filenames or arbitrary classes. It does not save files, persist runs, schedule work, or publish research.

## Fidelity evidence

A Python regression harness will run a direct subclass of the preserved original `Backtest` class and the ForexMax wrapper against the same provider-returned OHLCV frame, seed the original engine's random position identifiers, and compare normalized trades, positions, fees, portfolio value and drawdown within an explicit floating-point tolerance. Any comparison mismatch must be reported rather than normalized away.

## References

1. [Vercel — Using the Python Runtime with Vercel Functions](https://vercel.com/docs/functions/runtimes/python)
2. [Vercel — Python Functions in the `/api` Directory](https://vercel.com/docs/functions/runtimes/python/api-directory)
3. [AlphaBacktest source supplied by the user — MIT License](../apps/web/alphabacktest_py/vendor/LICENSE)
4. [yfinance README — Yahoo usage and research disclaimer](https://github.com/ranaroussi/yfinance)
