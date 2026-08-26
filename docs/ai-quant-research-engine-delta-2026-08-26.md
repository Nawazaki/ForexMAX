# Quant Research engine comparison: preserved AlphaBacktest vs modern core

## Scope

ForexMax now carries two deliberately distinct execution paths. **AlphaBacktest 1.0.0** remains the unmodified MIT-licensed Python reference and direct historical wrapper. `FOREXMAX_QUANT_ENGINE_0.1` is a new typed daily single-asset research core with a strict DSL, explicit data-quality gate, OOS split and robustness outputs.

The result below is a characterization comparison, not a parity certification for the modern core.

## Actual comparison run

Both paths used the same named S&P 500 Yahoo historical reference period, `2025-08-25` through `2026-08-25`, with SMA `20/60`, one unit, initial capital `20,000`, fee rate `0.00005`, slippage rate `0.0001` and leverage `1`. The provider returned the Yahoo/yfinance compatibility fallback during the comparison.

| Measure | Preserved AlphaBacktest | Modern core | Difference |
|---|---:|---:|---:|
| Orders / fills | 5 orders, 5 trades | 5 orders, 5 fills | Same count; ledger schema differs. |
| Closed positions | 2 | 2 | Same count. |
| Portfolio value | 20,568.379700 | 20,632.938378 | +64.558678 |
| Fees paid | 1.716082 | 1.720271 | +0.004190 |
| Dataset identity | `YAHOO:^GSPC:2022-08-23:2026-08-25` | `YAHOO:^GSPC:39859480ae598a9e` | Same provider/coverage; different versioning schemes. |

## Interpretation

The modern core is **not asserted equivalent** to AlphaBacktest. Its explicit cash/margin/fill records differ from AlphaBacktest's legacy interactions among free balance, asset value, on-hold collateral and the borrowed-book ledger. That is a material accounting-model delta, so the product labels the modern result as `MODERN_TYPED_SINGLE_ASSET_ENGINE` and retains the original engine in a separate **AlphaBacktest Reference** workspace.

> The prior direct-original-versus-wrapper regression remains the only `MATCHED` equivalence proof: it uses a tolerance of `1e-9` for AlphaBacktest orders, trades, positions, PnL history, portfolio value and fees. It proves the preserved integration path, not the new modern core.

## Consequence for release scope

The modern core can be used only as a Preview research foundation with its visible limitations. Any future claim of AlphaBacktest calculation compatibility for the new core requires a named accounting-parity milestone, deterministic fixtures, row-level normalized ledger comparison and a documented decision for each intentional deviation.
