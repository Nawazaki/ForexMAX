# Backtest Preview verification

**Feature commit:** `ffc8b3697c72ff6205d81006c7de9117b7e455d0` (`feat: add source-aware backtest lab`)

## Deployment

| Field | Verified value |
|---|---|
| Branch | `migration/nextjs-platform` |
| Vercel deployment | `dpl_CyDRmzDuaQ7P56Rfh1sp2VDrThcJ` |
| State | `READY` |
| Target | Preview; `target: null` |
| Public Preview URL | `https://forex-1m7t3vlpk-nawazakis-projects.vercel.app` |
| Framework | Next.js 16.3.2 / Turbopack |
| Production effect | None; no `main` change, Production deployment or environment change occurred. |

## Build evidence

The Vercel build completed successfully. It installed from the frozen pnpm lockfile, compiled Next.js and TypeScript, and generated **56 static pages**. The deployment build output lists `/backtest` as static and `/api/backtests` as a dynamic server route. No build error occurred.

## Runtime evidence

The Vercel runtime-error aggregation returned **no error clusters** for `/backtest` and `/api/backtests` in the one-hour verification window. The deployment-specific runtime-status grouping was empty because no external request reached the protected Preview during that window.

## Protected Preview boundary

The raw protected Preview request redirected with HTTP 302 to Vercel SSO and sent `x-robots-tag: noindex`. This is the expected Preview protection behavior, not an application failure. SSO was not changed. The source-aware UI and API flow were verified locally against an actual FRED request before the deployment; Vercel build output confirms the same static page and dynamic API route were deployed.

## Local functional evidence retained

The local functional check executed a constrained S&P 500 request using FRED data and returned source URL, publisher, reference dates, retrieval timestamp, data version, metric payload, equity curve, trade ledger, costs, assumptions and limitations. The client result page showed the complete source-aware result after the final chart-color correction. Research mode returned its explicit event-data blocker and no fabricated event study.

## Remaining boundaries

The Preview does not persist runs, accept user code/files, use a Python service, run background jobs, or calculate CPI/FOMC/NFP event distributions. Gold remains outside the initial backtest universe until an eligible historical price-source contract is connected.
