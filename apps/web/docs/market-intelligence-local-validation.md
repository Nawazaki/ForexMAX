# Market Intelligence Local Validation

## 2026-08-25

The local development build of `migration/nextjs-platform` was visually checked at `/markets/forex` and `/macro`.

| Route | Observed result |
|---|---|
| `/markets/forex` | The page renders source-contract status, four named official publishers, and publication requirements. It contains no price, forecast, trade signal, or claim that a live FX feed is active. |
| `/macro` | The official-data table renders BLS CPI-U, BLS unemployment, FRED DGS10, and the U.S. Treasury Fiscal Data public-debt record. Every row shows a source, reference period, and method limitation. |

This validation was local only. It did not read, write, migrate, or deploy Production infrastructure.
