# ForexMax — Live Data Provider Audit

**Audit date:** 2026-08-25 UTC  
**Production principle:** A displayed value must retain its publisher, source URL, observation/reference period, retrieval time, freshness status, and scope. A market observation is not a causal explanation, forecast, or recommendation.

## Activated Production readers

| Coverage | Publisher / route | Latest retrieval evidence | Refresh behavior | Status |
|---|---|---|---|---|
| U.S. CPI-U and unemployment | U.S. Bureau of Labor Statistics endpoints | Production page retrieved 2026-08-25 19:23 UTC; July 2026 reference period | Server revalidation target: 15 minutes | Active, source-labelled |
| U.S. 10-year nominal and real yields; broad dollar; EUR/USD, GBP/USD, USD/JPY; WTI; S&P 500; VIX | Federal Reserve Bank of St. Louis / FRED graph series | Production page retrieved 2026-08-25 19:23 UTC; each tape line shows observation date | Server revalidation target: 15 minutes; publisher date remains visible | Active, source-labelled |
| U.S. total public debt | U.S. Treasury Fiscal Data, Debt to the Penny | Production page retrieved 2026-08-25 19:23 UTC; 2026-08-21 reference date | Server revalidation target: 15 minutes | Active, source-labelled |

These readers do not persist values, create research assessments, run cron jobs, or automatically publish narrative content.

## Provider due diligence

| Provider | Eligible scope | Access / terms finding | Recommended activation state |
|---|---|---|---|
| FRED | Daily macro, exchange-rate, yield, energy, index and risk observations where a named series exists | Existing source path is live. FRED `NASDAQCOM` returned daily observations through 2026-08-24 in a bounded validation. | **Eligible for the next read-only Preview increment** after adding a named contract and test. |
| BLS | CPI, labor and official release metadata | Existing official reader is live in Production. | **Active**; release/event records still need an approved persistent evidence workflow. |
| U.S. Treasury Fiscal Data | Government debt and fiscal data | Existing official reader is live in Production. | **Active**. |
| EIA | Energy releases and energy statistics | APIv2 requires a free, registered API key. EIA requires source identification and prohibits false representation; responses have a 5,000-row ceiling and documented throttling. | **Deferred — requires secure server-side EIA key and exact route/series contract.** |
| CFTC COT | Weekly futures positioning for metals, energy, FX, rates, equities and VIX contracts | CFTC publishes Tuesday position data generally Friday at 3:30 p.m. ET; its Public Reporting Environment exposes API/download datasets and CFTC states normal use requires no token. | **Eligible for a bounded weekly contract-design and Preview validation.** No positioning interpretation or automatic bias until evidence/review exists. |
| BEA | GDP, PCE, personal income and related official statistics | BEA API registration requires a name, valid email and acceptance of its terms; API supplies published data and metadata. | **Deferred — requires a secure server-side BEA key.** |
| ECB SDMX | Euro-area statistics, FX reference data and monetary data | ECB documents an SDMX 2.1 REST web service for programmatic data and metadata access. | **Candidate — validate a specific series, update schedule and attribution before display.** |
| Gold, silver, DXY and Brent real-time pricing | Real-time market data | The active FRED contract does not provide a compliant named real-time source for these distinct instruments. The broad dollar index is not DXY and must not be labelled as DXY. | **Deferred — requires a source-specific contract and, where needed, provider approval/key.** |

## Bounded NASDAQ Composite series validation

The official FRED graph endpoint for `NASDAQCOM` returned published daily observations dated **2026-08-21** and **2026-08-24** in a bounded check on 2026-08-25. The next code increment therefore treats it strictly as a dated closing observation from the named FRED series, not as an intraday quote, a forecast, or an investable performance claim. A guessed silver series identifier returned HTTP 404 and was deliberately excluded.

## Explicit non-activation decisions

1. No source is labelled **LIVE** merely because it is fetched. Freshness must be calculated from the publisher observation date and retrieval time.
2. No value is hardcoded, manually entered, or substituted when an upstream source fails.
3. No market bias, probability, recommendation, causal claim, or automated narrative is published from the observation layer.
4. No cron, polling worker, or automatic publication has been enabled. Scheduled work requires an explicit architecture decision, deployed handler, idempotency, retry boundaries and a durable failure log.
5. No paid provider is activated. Any paid provider remains **DEFERRED — REQUIRES APPROVAL**.

## Architecture choices required before scheduled activation

| Option | Suitable cadence | Trade-offs | Cost / setup |
|---|---|---|---|
| Request-time cache revalidation | Official datasets with modest change frequency and user-driven traffic | Lowest operational complexity; data refreshes when pages are requested rather than at a guaranteed wall-clock time | Uses the existing web application; no new key for active readers |
| Scheduled server-side collection | Exact weekly COT or daily/periodic official releases | Enables durable fetch logs, deduplication, stale-data detection and retries; requires a reviewed database schema, deployment, callback security and selected source credentials | Setup required; no paid provider assumed |

## References

[1]: https://www.eia.gov/opendata/documentation.php "EIA API Technical Documentation"
[2]: https://www.eia.gov/opendata/register.php "EIA API Terms and Registration"
[3]: https://www.cftc.gov/MarketReports/CommitmentsofTraders/index.htm "CFTC Commitments of Traders"
[4]: https://www.cftc.gov/MarketReports/CommitmentsofTraders/ReleaseSchedule/index.htm "CFTC COT Release Schedule"
[5]: https://publicreporting.cftc.gov/stories/s/User-s-Guide/p2fg-u73y/ "CFTC Public Reporting API datasets"
[6]: https://apps.bea.gov/api/signup/ "BEA Data API"
[7]: https://data.ecb.europa.eu/help/api/overview "ECB Data Portal API overview"
[8]: https://www.ecb.europa.eu/stats/accessing-our-data/html/index.en.html "ECB all data services"
[9]: https://fred.stlouisfed.org/series/NASDAQCOM "FRED NASDAQ Composite series"
