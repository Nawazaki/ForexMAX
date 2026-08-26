# AI Quant Research UI local validation

## Initial rendering

On the local Next.js route `/backtest`, the Quant Research mode rendered as the default path. The visible flow was **Question → Build reviewable plan**, with the S&P 500 daily historical reference dataset preselected. The page visibly identified the following active safety boundaries:

| Check | Observed state |
|---|---|
| Question is review-gated | Visible explanatory copy before any run control. |
| AI claim | Explicit `AI PROVIDER: UNAVAILABLE`; no claim that a live model produced research. |
| Data claim | Explicitly labelled as Yahoo historical daily OHLCV reference data, not live pricing. |
| Strategy boundary | The empty state identifies the versioned SMA DSL and rejects scripts, expressions and arbitrary indicators. |
| Product boundaries | The governance section identifies event studies, intraday, multi-asset and persisted strategy memory as unavailable pending verified controls. |

## Interaction checkpoint

The **Build reviewable plan** control was activated in the browser, but the screen remained on the initial state. A follow-up view confirmed that the review-plan surface had not rendered. The browser Console contained only the standard React DevTools informational message and no client-side exception. The next validation step is to inspect the same-origin API response directly.

The same-origin `POST /api/quant-research` plan request was then invoked from the browser context. It returned HTTP `200` with a deterministic plan for `SP500`, including data requirements, validation steps, failure conditions, plan ID and `UNAVAILABLE` AI-provider status. A second simulated visual click again did not change browser state. Therefore the API contract is confirmed; the remaining local browser-automation transition will be checked by directly invoking the rendered control's DOM click handler.

The DOM click invocation also returned successfully but did not change the observed React state. This local browser-automation issue has not been treated as evidence that the endpoint or plan schema is invalid, because the same browser context directly received the valid `200` plan response. Server and runtime logs remain the next diagnostic source before a final local UI conclusion.

The local Next.js log then identified that the browser had been blocked from loading development chunks from `127.0.0.1`; `allowedDevOrigins` was updated with that local origin and the server restarted. The subsequent local page loaded the Next development indicator without the earlier cross-origin warnings. The browser tool's simulated click still did not move the component state. This remains an automation-specific limitation, while API validation, TypeScript, ESLint and the standard-environment production build are checked separately.

After an explicit pointer-event sequence was dispatched, the rendered React state transitioned successfully to **02 / REVIEW PLAN**. The local UI visibly showed the deterministic-plan notice, `UNAVAILABLE` AI-provider status, data requirements, validation steps, failure conditions, collapsed advanced DSL controls and the **Review complete — run bounded research** control. This confirms that the product flow prevents a run from the natural-language question until the review-plan surface has been created.

The reviewed run control was then activated. The interface entered **Running bounded research** state, confirming that the client sent the post-review run request rather than making the historical calculation available from the initial question state. The next check waits for its source-aware report payload.

## End-to-end result

The local UI completed a reviewed S&P 500 daily SMA run and rendered the source-aware report. The actual report named **Yahoo Finance via yfinance compatibility fallback**, labelled the data as `DAILY_SOURCE_REFERENCE`, displayed retrieval time `2026-08-26T09:13:59 UTC`, information cutoff `2026-08-25`, a content-based dataset version, `UNADJUSTED_RETURNED_OHLCV; auto_adjust=False`, and a passed three-part data-quality gate over 1,005 rows.

The rendered report separated in-sample data from OOS with a five-observation censor gap, showed bounded parameter and cost sensitivity tables, and labelled trade-order Monte Carlo as deterministic resampling rather than a forecast. It also kept limitations visible: Preview-only Yahoo/yfinance data, potential provider revisions, single-asset daily scope, absent event/intraday/multi-asset capability, and no durable research storage or strategy memory.

## Preview deployment verification

The governed Quant Research foundation deployed from `ce9d2107eb8b5d8b7cb7ea2687a2a99413032204` with Vercel runtime inventory `nodejs:3, python:2`. The follow-up metadata fix deployed from `8ef68a3c39cb2c392ace8ad905a8c8a3110c5a91` as deployment `dpl_53JL9CZxkSj9zqwizQqoHcsj9D6e`, state `READY`, at `https://forex-d4mww99q6-nawazakis-projects.vercel.app`.

The authorized Preview fetch returned `200` for `/backtest`, rendered the **Quant Research Workspace** title, canonical `https://www.forexmax.com/backtest`, and matching `WebApplication` structured data. The Preview HTTP response retains `x-robots-tag: noindex`, which is expected while Vercel Preview SSO stays unchanged. Vercel's scoped runtime-error check found no errors for `/backtest` or `/api/quant_research` in the deployment window.
