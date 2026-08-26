# Manus API × ForexMax Quant Research — Preview Integration

**Status:** Preview-only implementation validated at capability level
**Scope:** structured research-plan annotation only  
**Credential name:** `MANUS_API_KEY` in Vercel Preview only

## Purpose and boundary

The integration uses the Manus API v2 asynchronous task lifecycle to produce a **narrow, structured annotation** of an already-validated ForexMax research question. It does not select a data source, alter the allowlisted daily dataset, modify the Strategy DSL, create executable code, execute a backtest, publish a result, access a browser, use a connector, or recommend a trade. Task creation uses a strict `structured_output_schema`; results are accepted only after a second server-side validation pass.[1]

| Layer | Actual responsibility | Not permitted |
|---|---|---|
| Browser UI | Sends question and asset; shows a plan before Run | Receiving a secret, invoking Manus directly, running a strategy |
| ForexMax Python function | Validates asset/question, creates or retrieves a task, signs a short-lived task ticket, validates JSON | Exposing the API key, accepting code/files/URLs, confirming actions |
| Manus task | Frames a neutral historical review annotation | Browser use, connectors, tools, file access, code execution, forecasts, advice, trade recommendations |
| Existing Quant engine | Uses the reviewed plan ID and fixed SMA DSL for a separate bounded run | Treating AI prose as parameters or execution instructions |

## Request and result contract

The first request is `AI_PLAN_START`; it can occur only after the existing plain-text and allowlisted-asset validation. The function uses `POST /v2/task.create` with empty `connectors` and `enable_skills`, a constrained prompt, and a JSON Schema. Manus tasks are asynchronous, so the response carries a short-lived, HMAC-signed task reference rather than any credential.[2]

The client explicitly requests `AI_PLAN_RESULT` to fetch `task.listMessages`. No server-side worker, webhook, cron, polling loop, or persistent task storage is enabled. The function accepts only a successful `structured_output_result` containing these five fields:

| Field | Constraint |
|---|---|
| `research_intent` | Non-empty compact text, maximum 280 characters |
| `testable_hypothesis` | Neutral historical framing, maximum 280 characters |
| `validation_emphasis` | 1–4 compact text items |
| `limitation_emphasis` | 1–4 compact text items |
| `requires_human_review` | Must be exactly `true` |

Structured outputs must declare all object properties and disable additional properties; the provider schema follows those rules.[1] The result is normalized once at API retrieval and again before a `ResearchPlan` is built. The generated plan keeps the manual plan ID, so it cannot bypass the reviewed-plan gate in the backtest service.

## Preview safety controls

The key is stored only as a sensitive Preview environment variable and is never written to a repository, HTTP response, client bundle, task ticket, log message, or report. The function uses a 12-second outbound timeout and generic provider errors. Task tickets are HMAC-signed with the server-side key and expire after 15 minutes.

The Preview function additionally caps creation to three task starts per client over 15 minutes and two concurrent starts per warm function instance. This is deliberately labelled **best effort**: Vercel can create multiple function instances, so production-grade cross-instance rate enforcement and durable audit records require approved authentication plus isolated storage or edge controls. No such persistence is enabled in this stage.

If a task reports `waiting`, the function marks it `BLOCKED`; it will not submit an answer, confirmation, browser selection, connector authorization, payment decision, deployment decision, or other side effect. The documented task lifecycle supports such waiting states, but ForexMax intentionally declines them.[3]

## Verification plan

The Python contract suite validates schema strictness, no-secret status messages, prompt prohibitions, plan-ID preservation, and rate/concurrency bounds without a live API call. Live Preview validation first confirms `CONFIGURED`, then a user may explicitly create a structured annotation from the research workspace. The historical run remains unavailable until a plan is shown and reviewed.

## Preview verification record

The implementation first deployed in `91eca5d`, but Vercel Python 3.12 could not import `pandas_datareader` because that library tries to load the removed `distutils` package during function import. The package initializer and the `pandas_datareader` import were then deferred (`4dfa72a`, `7d4ba7e`) so the capability endpoint does not load historical-provider dependencies until an actual data fetch occurs.

Deployment `dpl_8FAKeLae6y3SCUFt5Vn9QVUDxBvD` reached `READY` at `https://forex-nzz52j4xh-nawazakis-projects.vercel.app`. A protected, authorized GET to `/api/quant_research` returned `200`, exposed `aiProvider.status: "CONFIGURED"` and `provider: "MANUS_API_V2"`, and did not expose the credential value. No external Manus task was automatically created during validation; task creation remains an explicit user action in the workspace, preventing an automatic use of the configured API.

## References

[1]: https://open.manus.ai/docs/v2/structured-output "Manus API v2 — Structured Output"
[2]: https://open.manus.ai/docs/v2/task.create "Manus API v2 — task.create"
[3]: https://open.manus.ai/docs/v2/task-lifecycle "Manus API v2 — Task Lifecycle"
