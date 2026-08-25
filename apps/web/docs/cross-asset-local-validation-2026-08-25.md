# Cross-Asset Desk Local Validation

## 25 August 2026

The local `migration/nextjs-platform` homepage was rendered after adding the read-only Market Tape and Market Brief.

| Area | Observed result |
|---|---|
| Market Brief | Renders latest/previous published values and reversible deltas for the 10-year nominal yield, 10-year real yield, broad U.S. dollar index, and WTI. Every rendered row names FRED and its observation date. |
| Market Tape | Renders rates, USD/FX, energy, and equities as compact source-linked observation groups. No assessment, probability, recommendation, or causal reaction statement is displayed. |
| Release watch | Links directly to BLS CPI, BLS Employment Situation, and Federal Reserve policy calendars without inventing dates, forecasts, actuals, or reactions. |
| Driver map | Shows evidence requirements for Gold, EUR/USD, and WTI; it explicitly identifies these as non-directional research frameworks. |
| Failure handling | One source input was unavailable during this local request. The UI rendered a visible status notice and did not substitute a value. The underlying request will be investigated before release. |
