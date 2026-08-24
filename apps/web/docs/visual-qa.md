# Visual QA notes

## 2026-08-24 — local Next.js preview

The desktop preview of the public home route loaded successfully with the dark ForexMax identity, gold/cyan accents, primary navigation, research cards and legal footer present. The inspected legacy article path `/articles/central-banks-gold-buying.html` resolved to the clean route `/articles/central-banks-gold-buying`, and the article content plus page metadata rendered without a runtime error.

The redirect destination was visually verified; its HTTP status is validated separately because the migration requires an explicit **301** rather than relying on a framework default. Database-backed admin, search and media workflows cannot be visually exercised until PostgreSQL, an admin account and Blob configuration are provided.
