# Five-Asset Cross-Asset Desk — Local Visual Validation

**Date:** 25 August 2026  
**Scope:** Local Next development server on `migration/nextjs-platform`; no Production request, change, or deployment was performed.

## Verified rendered surfaces

| Route | HTTP | Verified source-backed surface | Boundary confirmed |
|---|---:|---|---|
| `/markets/assets/gold-macro-drivers` | 200 | Dated FRED nominal 10Y, real 10Y and broad-dollar observations; BLS CPI and unemployment context; source links; prior values; reversible changes; reference dates; retrieval time and source-date freshness. | The page contains no gold price, performance figure, target, forecast, or directional Gold/XAUUSD assessment. It names the absent eligible gold-price contract. |
| `/markets/assets/usdjpy` | 200 | Dated FRED/H.10 USD/JPY, broad-dollar, nominal and real 10Y observations; prior values; changes; bounded earlier source records; reference dates; source links; retrieval time and quality labels. | The page labels values as dated official observations, not live or intraday quotes, and states that Bank of Japan policy/Japanese macro evidence is not connected. |

## Presentation checks

Both checked pages render the source-aware header, seven-column observation record, macro context, event-source section, evidence-linked driver framework, research boundary and risk/publication boundary. The rendered data-quality language is **“Latest official observation (source-dated)”** or **“Stale source observation”**; it does not call daily FRED records live or real-time. Event cards show no release time, forecast, actual or surprise where those fields were not retrieved.

## Homepage Market Brief and Tape

The local homepage renders a deduplicated count of **13** observations. The Market Brief uses only the latest and prior valid records for U.S. 10Y, broad dollar, EUR/USD, S&P 500, WTI and VIX, with a reversible absolute change and percentage change only where mathematically applicable. The compact tape displays 10 connected FRED observations by rates, dollar/FX, energy, equities and volatility with reference date, source link and the **“Latest official observation (source-dated)”** label. It contains no live-price claim and does not substitute an absent gold price.

## Pending local visual coverage

EUR/USD, U.S. 10Y and S&P 500 remain queued for the consolidated route/SEO/Preview verification pass after the full code quality checks and commit.
