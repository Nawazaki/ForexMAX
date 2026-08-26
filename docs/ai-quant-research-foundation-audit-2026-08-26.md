# ForexMax AI Quant Research Foundation Audit

## Decision summary

AlphaBacktest will become an **input to a modern research engine**, not a frozen implementation boundary. The current Python integration is valuable because it proves the existing account, portfolio, broker, order, position, fee, slippage and delayed-execution behavior can be exercised from ForexMax. It is not yet an adequate architecture for broad research, optimization or AI-guided analysis.

All development remains on `migration/nextjs-platform` and Preview. This audit authorizes no change to `main`, Production deployment, Production database, Production environment variables or DNS.

## Current-state audit

| Area | Current state | Decision |
|---|---|---|
| Engine loop | AlphaBacktest 1.0.0 runs one `Backtest` subclass over daily OHLCV with delayed order execution. | **Retain as the fidelity baseline**, then move equivalent behavior into a modern explicit execution core. |
| Portfolio and broker | Account, portfolio, trader and broker logic cover long/short positions, leverage, basic fees and slippage. | **Refactor** into typed domain records with deterministic IDs, explicit accounting invariants and testable transitions. |
| Data handling | One Yahoo path, with `pandas_datareader` first and `yfinance` fallback; three allowlisted assets; daily bars only. | **Replace** with a dataset registry, provider interface, adjustment policy and data-quality gate. Keep the current route only as a Preview research adapter. |
| Strategy model | One hard-coded SMA crossover wrapper subclass. | **Replace** with a versioned Strategy DSL compiled into verified strategy instructions. |
| Indicators | Legacy optional TA-Lib methods are preserved but inactive. | **Replace incrementally** with tested pure-Python/NumPy indicator functions where required by approved DSL nodes. |
| Results | Serializes equity, ledgers and a small metric set. | **Extend** into a versioned research-run report with data provenance, cutoffs, robustness results and limitations. |
| AI | No server-side provider contract or active model integration exists. | **Add abstraction only** until an approved server-side AI credential and model-cost policy are supplied. AI output must validate against JSON schemas/DSL; it cannot execute code. |
| Persistence | Research workflow persistence remains blocked because there is no authorized isolated database target. | **Keep non-persistent** in the first foundation milestone; model run records in memory/response only and mark durable research memory as blocked. |
| Runtime | One Vercel Python function packages successfully beside Next.js. | **Keep request-scoped short runs**; queue, long-running optimization and persistent workers are deferred until a separate hosting and storage decision. |

## Fidelity boundary

The existing regression result remains the initial guardrail: the current preserved engine and its wrapper matched on orders, trades, positions, PnL history, portfolio value and fees at tolerance `1e-9`. New engine components must add **characterization tests** before behavior changes. A difference is permitted only when it fixes a documented accounting/data defect and it must be versioned with an explanation, input fixture and before/after evidence.

## Target architecture

```text
Next.js Research Workspace
        ↓
Research API and schema validation
        ↓
AI Provider contract (structured plan only; optional until configured)
        ↓
Research Planner → Strategy DSL → Strategy compiler
        ↓
Execution / Portfolio / Analytics core
        ↓
Dataset Registry → Provider adapters → Data Quality Gate
        ↓
Robustness suite → Research Report
```

The target separates immutable dataset metadata, strategy definitions, execution assumptions, portfolio accounting, analytics and research interpretation. No layer may infer a recommendation. The report vocabulary must distinguish observed results, associated evidence, contradictory evidence and insufficient evidence.

## First foundation milestone

The safe deliverable for the next implementation increment is deliberately narrower than the full target product:

| Capability | Included now | Deferred / blocked |
|---|---|---|
| Natural-language workflow | A local, typed Research Plan draft and review flow. | Live AI model call until a server-side provider is authorized and a cost limit is configured. |
| Strategy | Long/short SMA-cross DSL with bounded parameters, position sizing, fees, slippage, leverage, exits and filters that can be proven by tests. | Arbitrary Python, user code, arbitrary indicators, partial fills and unverified execution models. |
| Data | Dataset registry and quality checks for the existing daily Yahoo research adapter; source, period, retrieved time, frequency, version, cutoff and limitations. | Intraday, 4H/1H/30M/15M, Gold/Silver/Oil/Crypto, licensed feeds and revision-sensitive macro data without approved contracts. |
| Robustness | Train/test split with censor gap, parameter sensitivity, transaction-cost sensitivity and deterministic trade-order Monte Carlo. | Durable long-running walk-forward jobs, regime model claims and broad multi-asset optimization. |
| Research report | Structured, source-aware JSON/HTML report that makes assumptions and failures explicit. | Automatic publication, personalized advice, signal delivery or trading execution. |

## Data-quality and no-look-ahead contract

Every dataset must declare the provider, dataset identifier, instrument, frequency, timezone, coverage, retrieval timestamp, adjustment policy, version and information cutoff. Before a run, the gate rejects missing or duplicate timestamps, unordered observations, insufficient warm-up data, unsupported frequency, invalid OHLCV ranges and an evaluation period not separated from the information cutoff by a censor gap. A failure blocks the run and becomes an explicit report finding.

## AI provider contract

`AIProvider` will only receive the user objective plus a **sanitized dataset/strategy capability inventory**. It returns a strict JSON schema containing a research objective, falsifiable hypotheses, data needs, candidate DSL strategies, validation plan, risk constraints and failure conditions. The service validates this object before showing the research plan. The model cannot call Python, shell commands, package installation, URLs, provider clients or persistence APIs.

At this stage, no active AI provider is configured in the deployed repository. The interface will have an explicit unavailable state rather than implying that a live model analyzed a research question. When activated later, it must use a documented server-side provider and a budget/rate-limit policy; no client-side credential or unofficial endpoint is permitted.

## Execution and operational limits

The existing function is appropriate for bounded, synchronous daily research runs. It is not the correct venue for unrestricted optimization, broad parameter grids, multi-asset simulations or an autonomous ten-iteration loop. Those capabilities remain limited by explicit variant/iteration budgets and will be promoted to queued work only after an approved persistence and hosting decision. No scheduler, polling, cron, background worker or automatic research publication is introduced by this milestone.

## References

1. [User-supplied AlphaBacktest source and MIT license](../apps/web/alphabacktest_py/vendor/LICENSE)
2. [Current AlphaBacktest integration decision](./alphabacktest-python-integration-decision-2026-08-26.md)
3. [AlphaBacktest fidelity report](./alphabacktest-fidelity-2026-08-26.md)
4. [Vercel Python runtime documentation](https://vercel.com/docs/functions/runtimes/python)
5. [yfinance project documentation and usage notice](https://github.com/ranaroussi/yfinance)
