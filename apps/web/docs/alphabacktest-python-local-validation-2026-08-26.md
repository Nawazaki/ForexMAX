# AlphaBacktest Python local validation

## Environment

The Next.js development UI was served from `http://localhost:3004/backtest`. A local HTTP server exercised the exact Python `api/alphabacktest.py` handler planned for Vercel. The local-only Next rewrite maps `/api/alphabacktest` to that handler during development; Preview does not use this rewrite.

## First visual check

The page loaded successfully with the `ALPHABACKTEST / PYTHON ENGINE / PREVIEW` label, the preserved-engine statement, bounded form fields, no-file/no-user-code boundary, original-provider disclosure and Research Backtest provenance gate. The UI lists only the currently supported assets: S&P 500, EUR/USD and USD/JPY. It does not claim real-time pricing.

## Pending completion

The standard browser click did not produce a visible state change in the inspection tool. A controlled client-side button dispatch then completed successfully. The resulting DOM showed `COMPLETED / ORIGINAL PYTHON ENGINE`, `AlphaBacktest 1.0.0 · PRESERVED_PYTHON_ENGINE`, the `Yahoo Finance via yfinance compatibility fallback` provider identity, source URL, daily-reference period, retrieval timestamp, version string, portfolio-value curve and the original broker trade and portfolio position ledgers.

The selected S&P 500 run returned the dated period `2025-08-25` through `2026-08-25`; the UI labels the output historical, not a forecast or signal. Its numerical result is intentionally not interpreted in this validation record. The page also displayed the remaining boundaries: Yahoo availability and revisions, single-asset original-engine scope, unverified TA-Lib indicator compatibility and blocked event research.

## Research-mode check

The local interface was switched to Research Backtest and invoked the same Python handler's capabilities response. Research mode remains `BLOCKED` because verified event timestamps and information-cutoff provenance are not connected. The response lists the original source indicator names but deliberately reports no active serverless TA-Lib indicator until native compatibility is separately verified.

The visual result showed the `BLOCKED` status, its exact provenance reason and the original indicator list (`SMA`, `EMA`, `RSI`, `Bollinger Bands`, `MACD`) with an explicit statement that no serverless indicator is active. No market-event result, return distribution or directional conclusion was produced.
