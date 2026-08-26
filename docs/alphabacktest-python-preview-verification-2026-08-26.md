# AlphaBacktest Python Preview verification

## Deployment

| Field | Verified value |
|---|---|
| Functional commit | `108580e` — `feat: integrate preserved AlphaBacktest python engine` |
| Preview head during verification | `3d97768` — Python-bytecode cleanup only |
| Branch | `migration/nextjs-platform` |
| Deployment | `dpl_8rgWosVpUjKK7AyVwNeYsw3QNHtH` |
| State | `READY` |
| Target | Preview (`target: null`) |
| URL | `https://forex-34eb15gvj-nawazakis-projects.vercel.app` |
| Runtime inventory | Vercel reported `nodejs:3` and `python:1` functions. |
| Production effect | None; `main`, Production deployment, database, environment variables and DNS were not changed. |

## Build evidence

Vercel completed the Next.js 16.3.2 build successfully, type checked it and generated 56 static pages. It then selected Python 3.12, created a Python virtual environment, installed `apps/web/requirements.txt`, compiled Python bytecode and completed output deployment. This proves that the Preview contains a separately deployed Python function, rather than only a Next.js/TypeScript implementation.

## Runtime and access evidence

Vercel runtime-error aggregation found no error clusters for `/backtest` and `/api/alphabacktest` in the one-hour verification window. Deployment-specific runtime status grouping was empty because the externally initiated check stopped at Vercel SSO. The protected Preview correctly returned a 302 SSO redirect with `x-robots-tag: noindex`; SSO was not changed.

The deployed Python function could therefore be proved by Vercel runtime inventory and build packaging but not directly invoked through the protected external reader. The same saved Python handler was locally invoked by HTTP, returned a complete original-engine result, and was visually exercised through the Next.js interface before deployment. The original-vs-wrapper fidelity regression passed at tolerance `1e-9`; see `docs/alphabacktest-fidelity-2026-08-26.md`.

## Boundaries retained

The deployed Preview does not accept arbitrary Python, scripts, local files, URLs or dynamic strategy code. It has no persistence, scheduler, queue, automatic publication or trading execution. Yahoo/yfinance remains Preview research-only, with the actual provider route made visible on every result.
