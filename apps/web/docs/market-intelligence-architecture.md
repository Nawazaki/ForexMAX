# ForexMax Research Intelligence Architecture

## Purpose

ForexMax is evolving from an article-led CMS into a research platform. This architecture preserves the current editorial workflow while introducing traceable research records, a first-party source registry, and review gates before publication.

## Current baseline

The live schema currently models articles, audits, prop firms, media, authors, categories, tags, and generic sources. It does not yet model markets, assets, research events, evidence-level verification, companies, brokers, market bias, data quality checks, or a research queue. Public pages currently render articles, audits, and content pages.

## Research record model

The first schema expansion should introduce the following concepts without fabricating prices, scores, or conclusions.

| Entity | Responsibility | Required traceability |
|---|---|---|
| `Market` | A market grouping such as FX, metals, macro, or rates | Slug, name, description, status |
| `Asset` | A public research subject such as XAUUSD or EURUSD | Market, symbol, display name, active status |
| `ResearchEvent` | A deduplicated real-world event under review | Topic, market, region, importance, discovered/published/verified timestamps, lifecycle status |
| `ResearchEvidence` | A source-specific statement or record attached to an event | Source, original URL, captured evidence, publication time, access time, verification status |
| `ResearchAssessment` | An analyst-authored, non-automatically-published assessment | Thesis, risk factors, confidence rationale, reviewer, status |
| `DataQualityCheck` | A repeatable operational check | Check type, result, scope, observed timestamp, human resolution |

## Lifecycle

```text
Source discovery
  → extraction
  → URL/content deduplication
  → event classification
  → evidence verification
  → analyst assessment
  → review
  → publication
  → update or archive
```

Only reviewers may move an assessment to a public state. Automation can create a queue item, identify a duplicate candidate, or mark a source stale; it cannot publish an assertion, a price, a rating, or a probability.

## Research status rules

| Status | Meaning | Public visibility |
|---|---|---|
| `DISCOVERED` | Candidate source or event received | No |
| `TRIAGE` | Scope and duplicate review pending | No |
| `VERIFYING` | Evidence is being checked against original sources | No |
| `DRAFT` | Analyst research draft exists | No |
| `REVIEW` | Reviewer decision pending | No |
| `PUBLISHED` | Reviewed content is eligible for public display | Yes |
| `UPDATED` | Published content was materially refreshed | Yes, with update time |
| `ARCHIVED` | Retained for traceability but no longer current | Noindex or inaccessible by policy |

## Source policy

The initial public source directory contains only the official Federal Reserve/FRED, BLS, and BEA starting points. New sources must record their original URL, organization, jurisdiction, source type, access constraints, and the time they were last verified. Community posts can create leads but never become verified evidence without a primary or independently authoritative source.

## Market bias guardrail

An asset bias must remain unavailable until all required measurable inputs have a documented source, timestamp, transformation method, and evidence trail. When inputs are unavailable or stale, the UI must show `Data unavailable` rather than a directional score.

## Initial delivery sequence

1. Ship the public source directory and source registry.
2. Add the research data model and migration only after schema review.
3. Add a restricted admin source manager and research queue.
4. Add public market pages that show source-backed research or an explicit unavailable state.
5. Add deterministic data-quality checks and scheduled collection only after their source contracts, retry limits, logging, and hosting route are approved.

## References

- Federal Reserve: https://www.federalreserve.gov/data/data-download-fred-information.htm
- BLS CPI: https://www.bls.gov/cpi/
- BEA: https://www.bea.gov/

## Validation record

- Local preview verified on 24 August 2026: `/` renders the Market Intelligence briefing, explicit availability states, documented research, and control principles.
- Local preview verified on 24 August 2026: `/sources` renders all current official-source directory records with external official links and the verification policy.
