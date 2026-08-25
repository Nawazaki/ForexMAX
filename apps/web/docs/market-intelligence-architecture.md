# ForexMax — Market Intelligence Product Architecture

## 1. Product decision

ForexMax will evolve from an article-led editorial site into a **source-aware market intelligence and financial research platform**. The product must help a reader distinguish between a recorded fact, a source-backed data point, an observed event, analyst interpretation, and a forward-looking assessment. It is not a signal service, a price-prediction engine, or an automated content mill.

> **Core rule:** a public conclusion must remain traceable to its source, timestamp, evidence record, and review state. If any of these are missing, the platform shows `Data unavailable` or `Requires review`; it does not infer a fact.

## 2. Current-state audit

| Existing area | Reuse | Replace or extend | Reason |
| --- | --- | --- | --- |
| Next.js App Router, TypeScript, Vercel Preview | Yes | Extend route families only on `migration/nextjs-platform` | The production stack is stable and Preview deployments already work. |
| Prisma 7 + Supabase PostgreSQL | Yes | Additive schema expansion and safe migrations | Current schema supports editorial records but lacks market, evidence, queue, and quality entities. |
| Supabase Auth, editor roles, RLS policy pattern | Yes | Extend to new research models | Existing `ADMIN` / `EDITOR` controls and security-function pattern are suitable for a controlled research workflow. |
| `ResearchSource` and source directory | Yes | Turn it into the Source Registry foundation | It needs verification, ownership, reliability, jurisdiction, and document-level metadata. |
| Article, audit, author, media, category and SEO plumbing | Yes | Link published research to events, assets, evidence and related entities | These remain valid publication surfaces. |
| Current public header and uniform `ContentCard` grid | No | Replace with an editorial navigation system and mixed information modules | The current UI does not express market taxonomy, evidence state, or research hierarchy. |
| Homepage | No | Replace with research-desk information hierarchy | It must prioritize availability, evidence, developments, calendar context and source attribution over promotional layout. |
| Existing legacy content | Preserve | Do not restate, automatically upgrade or invent new claims | Migration history remains intact; new records must follow the new evidence rules. |

## 3. Public information architecture

### Primary navigation

The new navigation is organized around research subjects rather than CMS content types:

| Navigation family | Initial public route | Initial state |
| --- | --- | --- |
| Markets | `/markets` | Research directory and data-availability overview |
| Macro | `/markets/macro` | Event and source context; no fabricated release values |
| FX | `/markets/forex` | Asset coverage directory; source-backed items only |
| Commodities | `/markets/commodities` | Asset coverage directory; source-backed items only |
| Indices | `/markets/indices` | Data-unavailable state until a verified contract is connected |
| Crypto | `/markets/crypto` | Data-unavailable state until a verified contract is connected |
| Economy | `/economy` | Economic-release coverage and methodology |
| Central banks | `/central-banks` | Central-bank source records and related research |
| Companies | `/companies` | Reserved until a company evidence model and useful content exist |
| Research | `/research` | Research archive and controlled assessment records |
| Risk | `/risk-intelligence` | Existing risk material, then evidence-backed drivers |
| Tools | `/tools` | Existing deterministic calculators, clearly non-advisory |
| Sources | `/sources` | Public primary-source directory and verification policy |

Pages become indexable only when they have a unique purpose, unique metadata, and enough source-backed content to answer a reader’s question. Empty templates and auto-generated asset pages remain unavailable or noindex rather than becoming thin SEO pages.

### Homepage composition

The homepage becomes a compact research briefing with the following fixed editorial order:

1. **Research status strip** — data freshness, verification status, publication controls, and source directory entry point.
2. **Market coverage matrix** — only source-backed values when a documented data contract exists; otherwise explicit availability states.
3. **Top developments** — deduplicated Research Events ranked by evidence, source quality, recency, and stated market relevance.
4. **Why markets are moving** — evidence-led factor panels that separate facts from interpretation.
5. **Macro calendar** — releases with only the fields that are documented by an official source.
6. **Published research** — articles and audits linked to sources and review times.
7. **Risks and catalysts** — upside/downside drivers, invalidation conditions, and upcoming events, never a trading recommendation.
8. **Source trail** — provenance and public access to original records.

Charts are optional components. A chart may render only after the application stores the source, retrieval timestamp, coverage period, transformation method, and data-quality status for every displayed series.

## 4. Evidence and assessment model

### Semantic distinction

| Layer | Meaning | Example public treatment |
| --- | --- | --- |
| Fact | A directly attributable statement from an original document | Quote, source URL, publication time and verifier status |
| Data | A measured value with source, unit, period and observation time | Table or chart only when all fields are present |
| Event | A deduplicated real-world occurrence | Timeline entry with linked evidence |
| Evidence | A source-specific record supporting or challenging an event | Stored privately until a reviewer permits publication |
| Interpretation | A human-authored explanation of potential relevance | Clearly labeled as analysis, linked to supporting evidence |
| Assessment | A reviewable thesis with drivers, risks, invalidations and catalysts | Never auto-published; no unsupported numeric probability |
| Forecast | A forward-looking view | Explicitly labeled and excluded unless methodology and evidence are documented |

### Lifecycle gates

```text
Source / source document
  → ingest candidate
  → normalize and deduplicate
  → classify to markets, assets, countries and events
  → verify evidence
  → analyst draft / assessment
  → editorial review
  → publish, update, archive or reject
```

Automation may create a candidate, preserve retrieval metadata, propose a duplicate, calculate a deterministic freshness state, or mark a source stale. It may **not** publish a financial claim, price, assessment, rating, forecast, social post, or comparison.

## 5. Additive database blueprint

No existing table is deleted or rewritten. The implementation begins with an additive migration and empty controlled tables; it does not seed prices, economic releases, assessments or research events merely to populate a UI.

| Entity | Responsibility | Essential fields |
| --- | --- | --- |
| `Market` | Taxonomy such as forex, commodities, macro or indices | slug, title, description, public status |
| `Asset` | A research subject such as EUR/USD or XAU/USD | market, symbol, display name, asset type, status |
| `Country` | Jurisdiction mapping | ISO code, name, region |
| `CentralBank` | Official monetary authority | country, name, official URL, status |
| `SourceProfile` | Source registry expansion replacing generic-only metadata | organization, source type, primary/secondary tier, jurisdiction, verification/freshness metadata |
| `SourceDocument` | A retrievable original record | source URL, headline, author, published/retrieved dates, content hash, access status |
| `ResearchEvent` | A deduplicated event that may affect markets | event type, importance, region, lifecycle status, timestamps |
| `ResearchEvidence` | A document-level fact or conflicting observation | source document, event, excerpt, evidence type, verification status, verifier |
| `ResearchAssessment` | Analyst-written drivers, risks and invalidation criteria | event/asset scope, thesis, status, reviewer, methodology reference |
| `AssessmentDriver` | Upside/downside/risk/catalyst/invalidation item | assessment, direction, narrative, supporting evidence |
| `EconomicRelease` | Official macro release reference | indicator, event date, previous/forecast/actual only when sourced, data status |
| `DataQualityCheck` | Deterministic or reviewed data-quality result | scope, check type, status, observed time, resolution |
| `IngestionJob` | Auditable collection attempt | source, job type, started/finished time, dedupe status, error summary |
| `EditorialReview` | Publication approval or rejection | subject, reviewer, decision, decision time, rationale |

### Status taxonomy

| Category | Initial values |
| --- | --- |
| Research event | `INGESTED`, `PROCESSING`, `REQUIRES_REVIEW`, `VERIFIED`, `PUBLISHED`, `REJECTED`, `STALE`, `ARCHIVED` |
| Evidence | `UNVERIFIED`, `VERIFYING`, `VERIFIED`, `CONFLICTED`, `REJECTED` |
| Data quality | `VERIFIED`, `DELAYED`, `STALE`, `UNAVAILABLE`, `REQUIRES_REVIEW` |
| Assessment | `DRAFT`, `REVIEW`, `APPROVED`, `PUBLISHED`, `SUPERSEDED`, `REJECTED` |

Every published item must retain `sourceUrl`, `publishedAt` (when available), `retrievedAt`, verification state, and its related evidence. Assessments may only use a confidence label if an analyst records its rationale and the UI exposes its non-predictive methodology.

## 6. Research CMS and control center

The existing editorial administration remains the base access-control system. New modules will be built around the research lifecycle rather than generic post editing:

1. **Source Manager** for source profiles and document metadata.
2. **Research Queue** for candidates, duplicates, verification and rejection reasons.
3. **Event workbench** for assets, regions, market relevance and evidence links.
4. **Assessment editor** for drivers, downside factors, invalidations and catalysts.
5. **Editorial review** for controlled approval and immutable decision history.
6. **Data quality register** for stale, delayed, unavailable or failed source states.
7. **Job monitor** only after deterministic ingestion is designed and approved.

## 7. SEO and performance contract

The existing shared metadata function, canonical host policy, sitemap and robots controls are retained. New entity pages must add the following only when useful and supportable:

- canonical metadata, Open Graph and Twitter metadata;
- `BreadcrumbList` for genuine hierarchical navigation;
- `Article` schema for published articles and audits;
- `Dataset` schema only when an actual documented dataset is publicly represented;
- `Organization` and `WebSite` schema at the site layer;
- public related links based on actual linked assets, events and evidence;
- indexed sitemap inclusion only for published, useful, non-thin pages.

The platform favors server components, static generation for stable verified entity pages, targeted revalidation for source-backed updates, database indexes, pagination, lazy media, and minimal client JavaScript. Search remains noindex on query URLs and will expand only after the new entity types have source-backed records.

## 8. Automation decision and deferred operating model

High-frequency market polling, feeds and automatic research generation are **not** implemented in this milestone. The project is currently a Vercel-hosted Next.js application, and Preview is the mandated development environment. A later ingestion design must first specify a source contract, legal access path, rate limit, retry policy, cache policy, deduplication key, failure state, data-quality check, approval gate, and ownership model.

Before any background worker or schedule is enabled, ForexMax will present two viable operating choices to the owner:

| Approach | Best use | Trade-offs | Cost and complexity |
| --- | --- | --- | --- |
| Scheduled deterministic ingestion | Low-frequency official releases and bounded API calls | Stateless and simple; unsuitable for continuous or sub-minute feeds | Lower operational complexity; requires source-specific jobs and logging |
| Persistent queue worker | High-frequency polling, durable retries, or multi-step ingestion | More control and lower latency; requires an explicit hosting and monitoring decision | Higher operational complexity and potentially recurring hosting cost |

No Vercel Cron, polling loop, worker, paid hosting change, API key, or connector is created until the owner chooses an approach after reviewing the source contracts and operational implications.

## 9. Delivery sequence

| Phase | Deliverable | Explicitly out of scope |
| --- | --- | --- |
| A — redesign foundation | Editorial navigation, market-route shells, evidence-state UI, architecture documentation | Real-time prices, fabricated dashboard values, cron jobs |
| B — data model | Additive Prisma/Supabase migration and empty controlled research entities | Destructive migration, automatic public records |
| C — research control center | Source Manager, Research Queue, reviewer gates and audit log | Automated publishing |
| D — source-backed public pages | Market and asset pages that render real evidence or transparent unavailable states | Thin programmatic pages |
| E — deterministic data contracts | Individual official-source integrations with quality checks | General scraping or unlicensed news reproduction |
| F — operations | Approved scheduling/queue approach, retries, monitoring and human publication controls | Unapproved persistent process or paid hosting change |

## 10. Acceptance gates

Every substantial phase must pass unit tests, TypeScript, ESLint, production build, relevant route smoke tests, SEO review, migration review, secret scan, and a READY Vercel Preview. `main`, Production, DNS, TLS and Vercel SSO remain unchanged unless the owner gives renewed, explicit authorization.

## 11. Initial official-source starting points

- Federal Reserve/FRED: https://www.federalreserve.gov/data/data-download-fred-information.htm
- U.S. Bureau of Labor Statistics CPI: https://www.bls.gov/cpi/
- U.S. Bureau of Economic Analysis: https://www.bea.gov/

These are source-registry starting points, not claims that every ForexMax research item has already used them.

## 12. Local redesign validation

- Local preview verified on 24 August 2026: `/` renders the editorial Market Intelligence briefing, an explicit market-availability monitor, research list, coverage directory, and evidence-control panels without displaying a market price, probability, or directional call.
- Local preview verified on 24 August 2026: `/markets` renders the source-aware market coverage directory with `Data unavailable` or `Requires review` states and links to non-indexable coverage detail routes.
