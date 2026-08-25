# ForexMax Market Intelligence — Preview Release Report

**Release commit:** `31a12dd50213c15acbbbf00b16208a3d37b0d42b`  
**Branch:** `migration/nextjs-platform`  
**Scope:** Preview only. No `main`, Production deployment, DNS, Production environment-variable, or Supabase Production change was made.

## Deployment result

| Field | Verified result |
|---|---|
| Git push | Successfully pushed from `725ab36` to `31a12dd` on `migration/nextjs-platform`. |
| GitHub branch head | `31a12dd50213c15acbbbf00b16208a3d37b0d42b`. |
| Vercel deployment ID | `dpl_CGrr3Cb27KpVRUf7BCUYpfHun7mY`. |
| Vercel status | `READY` — Preview target (`target: null`), not Production. |
| Preview URL | https://forex-1qt1h0tkf-nawazakis-projects.vercel.app |
| Stable branch alias | https://forex-max-git-migration-nextjs-platform-nawazakis-projects.vercel.app |
| Framework | Next.js 16.3.2 with Turbopack. |
| Build duration | Vercel recorded output completion in approximately 20 seconds after build start. |

## Build verification

Vercel cloned the expected repository and branch, explicitly recorded commit `31a12dd`, installed with `pnpm install --frozen-lockfile`, compiled successfully, completed TypeScript, and generated **53 static pages**. The build log explicitly lists the new SSG route family:

```text
/markets/assets/[asset]
├ ● /markets/assets/gold-macro-drivers
├ ● /markets/assets/eurusd
├ ● /markets/assets/us-10y
└ ● [+2 more paths]
```

No build errors were reported. The local verification suite also completed successfully:

| Check | Result |
|---|---|
| Unit tests | **54 tests** across **23 files** passed. |
| TypeScript | Passed with `tsc --noEmit`. |
| ESLint | Passed. |
| Production build | Passed locally and on Vercel. |
| Local visual review | Homepage and Gold Macro Drivers page reviewed; source links, dates, evidence boundaries, and responsive structure rendered as intended. |

## Visible product changes

The homepage is now a source-aware **Cross-Asset Intelligence Desk** rather than a narrow macro landing page. It renders a dated Market Brief with a mathematically reversible latest-versus-prior change for published FRED observations, while explicitly stating that these values are not explanations, forecasts, trading signals, or measures of market impact.

The Market Tape groups named and dated observations for nominal and real U.S. 10-year yields, a broad trade-weighted U.S. dollar index, EUR/USD, GBP/USD, USD/JPY, WTI, the S&P 500 index, and CBOE VIX. The page also keeps its BLS CPI-U, BLS unemployment, Treasury debt, and existing DGS10 desk intact. Every new tape line points to the named FRED source record.

Five substantive asset-context routes were added and included in the sitemap: Gold Macro Drivers, EUR/USD, U.S. 10-Year, S&P 500, and WTI. They combine the source-backed observation table, relevant official release links, evidence requirements, and a publication boundary. The gold page intentionally has no gold price, target, or directional assessment because no eligible current gold-price contract has been activated.

## Runtime and page-check result

The Vercel runtime-error aggregator reported **no runtime errors** during the one-hour post-deployment review. The deployment-specific runtime-log query returned no application log entries, which is consistent with no authenticated request reaching the deployed application during the audit window.

> **Live HTTP limitation:** The Preview is protected by Vercel SSO. An internal access-link fetch was redirected to Vercel SSO with HTTP 302 and `x-robots-tag: noindex`; this occurred before the request reached the application. SSO was not disabled or changed. The deployed routes are nevertheless confirmed by Vercel's successful static-generation manifest and were rendered locally from the identical commit.

## Remaining blockers and deliberate exclusions

| Item | Status |
|---|---|
| Browser-level request through protected Vercel Preview | Blocked by the existing SSO gate; no change made. |
| Gold live price / XAUUSD assessment | Not activated; a compliant current gold-price data contract is still required. |
| DXY, Nasdaq, Brent, crypto, CFTC positioning, and event reaction study | Not added; no approved source contract/data model has yet been activated for a public claim. |
| Economic calendar fields (date, forecast, actual, surprise) | Contracts exist, but fields remain absent until an approved official event source retrieves and verifies them. |
| Source Manager, Research Queue, Evidence Records, Editorial Review CRUD | Still intentionally blocked pending an explicitly approved non-Production persistence environment. |
| Cron, polling, scraping, automatic publishing | Not created or enabled. |

The release is therefore a verified **read-only Preview product improvement**, not a claim that the full ingestion, editorial, or CMS workflow is now operating.
