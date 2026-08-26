# ForexMax AI Quant Research Architecture

## Architecture decision

The active execution path will evolve from the current AlphaBacktest wrapper into a **modern Python research core**. The user-supplied AlphaBacktest source remains in the repository only as a traceable provenance artifact and a regression oracle during migration; it will not remain the permanent HTTP execution boundary. Existing fidelity fixtures protect verified broker/accounting behavior until a documented correction deliberately changes it.

## Module boundaries

| Module | Responsibility | Must not do |
|---|---|---|
| `quant_research/contracts.py` | Immutable run, dataset, strategy, execution and report schemas. | Fetch data, execute code or make network calls. |
| `quant_research/datasets.py` | Asset registry, provider interface and versioned dataset metadata. | Emit a strategy signal or infer market direction. |
| `quant_research/quality.py` | Validate OHLCV coverage, duplicates, timestamps, adjustments, warm-up and cutoff. | Repair or silently fill data. |
| `quant_research/dsl.py` | Parse and validate bounded strategy definitions. | Evaluate arbitrary Python/expressions. |
| `quant_research/engine.py` | Deterministic order scheduling, fill assumptions, position state and portfolio accounting. | Fetch data or call an AI model. |
| `quant_research/indicators.py` | Pure, versioned numerical indicators used by approved DSL nodes. | Depend on inactive TA-Lib at runtime. |
| `quant_research/analytics.py` | Return, drawdown, risk and ledger analysis. | Select a strategy or make a forecast. |
| `quant_research/robustness.py` | OOS split, parameter and cost sensitivity, deterministic Monte Carlo. | Overwrite a base run or call a persistent worker. |
| `quant_research/reports.py` | Produce an auditable research report from run artifacts. | State personalized advice or future performance. |
| `quant_research/ai_provider.py` | Define structured plan/hypothesis provider contract. | Execute Python, queries, URLs or a strategy directly. |

## Core contracts

### Dataset contract

```text
DatasetRef
  id, provider, source_url, instrument, frequency, timezone
  coverage_start, coverage_end, retrieved_at, version
  adjustment_policy, information_cutoff, quality_status, limitations
```

`DatasetRef` is immutable once assigned to a run. It makes an historical result reconstructable and distinguishes source reference time from retrieval time. The initial adapter is the existing daily Yahoo research adapter only; it will retain its explicit `yfinance` fallback label. No intraday, Gold, multi-asset, event or revision-sensitive macro dataset is represented as available until a documented data contract exists.

### Strategy DSL

```json
{
  "schemaVersion": "1",
  "id": "sma-cross-v1",
  "universe": ["SP500"],
  "frequency": "DAILY_SOURCE_REFERENCE",
  "indicators": [
    {"type": "SMA", "id": "fast", "window": 20},
    {"type": "SMA", "id": "slow", "window": 60}
  ],
  "entry": {"longWhen": "fast_above_slow", "shortWhen": "fast_below_slow"},
  "exit": {"onSignalFlip": true},
  "positionSizing": {"type": "FIXED_UNITS", "units": 1},
  "execution": {"fill": "NEXT_REFERENCE_OPEN", "feesRate": 0.00005, "slippageRate": 0.0001, "leverage": 1},
  "risk": {"maxPositions": 1}
}
```

The compiler accepts only enumerated operators and fields. It creates a typed `CompiledStrategy` that reads strictly prior information and queues the fill to the next allowed observation. The user, an AI provider and the browser may submit JSON only; none can submit Python, JavaScript, a file path, class name, import or URL.

### Research plan contract

```text
ResearchPlan
  id, objective, hypotheses[], dataset_requirements[], universe[]
  candidate_methods[], validation_plan, risk_constraints
  failure_conditions[], provider_status, review_status
```

An active AI provider may propose this object but it cannot start execution. The user must review the plan and the server must validate its references against the available dataset and DSL registries before creating any run.

The initial stateless API requires the deterministic `plan_id` generated from the reviewed question and asset in the run request; the server recomputes it and rejects a mismatch. This protects the question/asset binding, but it is not a durable proof of human review because approved isolated persistence and user audit logging are deliberately absent.

### Run and report contracts

```text
ResearchRun
  run_id, strategy_version, dataset_ref, information_cutoff
  execution_assumptions, in_sample_window, oos_window
  base_result, robustness_results, limitations, status

ResearchReport
  question, hypothesis, methodology, dataset_provenance
  execution_assumptions, metrics, OOS, robustness
  observed_findings, contradictory_evidence, failures, limitations
```

The report cannot use the word *verdict* as a trade recommendation. It summarizes historical findings as observed, associated, contradictory or insufficient evidence.

## Migration path

| Step | Existing AlphaBacktest behavior | Modern replacement | Fidelity requirement |
|---|---|---|---|
| 1 | SMA wrapper queues an order during a bar and executes at the next source open. | `ExecutionSimulator` uses an explicit pending-order queue. | The current SMA scenario remains matched before enabling the new API. |
| 2 | Mutable pandas tables and random identifiers. | Typed order, fill, position and ledger records with deterministic IDs. | Compare normalized ledgers, fees, final value and equity curve. |
| 3 | Legacy in-class accounting. | Explicit long/short cash, exposure, fee and slippage accounting. | Differences require a named accounting-correction record. |
| 4 | `pandas_datareader`/`yfinance` data fetch inside a provider. | Dataset provider registry plus quality gate. | Input OHLCV fixture/version is retained for every differential test. |
| 5 | One subclass controls strategy. | DSL compiler with approved SMA node set. | Compiled SMA strategy must reproduce the characterization fixture. |

## First implementation scope

The following are feasible in bounded Preview requests and will be built now: a daily data quality gate; typed daily dataset metadata; a long/short SMA DSL; a modern single-asset execution core; a dataset cutoff/OOS split with a mandatory censor gap; parameter and transaction-cost sensitivity; deterministic trade-order Monte Carlo; and a source-aware report.

The following remain explicitly unavailable: unrestricted LLM autonomy, arbitrary strategy code, persistence-backed strategy memory, concurrent long-running optimizer jobs, multi-asset portfolio simulations, intraday timeframes, event studies, walk-forward queues, regime claims and production signal delivery. A later persistent/queued architecture requires a separate hosting and data-storage decision.

## AI provider boundary

The initial `AIProvider` registry exposes `UNAVAILABLE` until an official server-side provider credential, model selection, spending limit, authentication and rate limit are configured. This is deliberate: a text prompt alone is not evidence that an AI model generated a valid research plan. When enabled, the provider will use a strict JSON-schema response and may only return `ResearchPlan` and DSL candidate data. The compiler, quality gate and execution limits remain the enforcement points.

## UX flow

The default screen becomes **Question → Research Plan → Review → Run → Results → Report**. Advanced execution inputs remain collapsed until the plan passes validation. The question text never executes directly; it becomes an untrusted research objective passed to the provider boundary. If no AI provider is active, the product must display a clear configuration status and offer the user an auditable manual DSL route rather than fabricate analysis.

## Security and operating limits

The foundation uses server-side execution only, a bounded request body, allowed assets, schemas, maximum one active position and fixed run/variant budgets. It will add a read-only capability endpoint and a run endpoint that reject unknown fields. Persistent run storage, user authorization, rate limits and audit retention are not falsely claimed; each needs a later authenticated persistence decision. Preview SSO remains the outer protection for the current Preview deployment.
