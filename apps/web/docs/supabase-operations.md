# ForexMax Supabase operations

The active Supabase project reference is recorded outside application code. The project has an idempotent database migration set under `supabase/migrations/`, with the legacy content seed generated through `pnpm seed:sql`.

| Resource | Migration responsibility | Access model |
|---|---|---|
| CMS tables | `20260824_001_forexmax_cms.sql` | RLS enabled; public reads are limited to published public content. |
| RLS internals | `20260824_002_private_security_functions.sql` | Authorization helpers and auth trigger live in the non-exposed `private` schema. |
| General pages | `20260824_003_content_pages.sql` | Published pages are served through the public Next.js route. |
| Media bucket | CMS migration | Public read for rendered media; authenticated editors only may upload, modify, or delete. |

The content generator deliberately counts **16 public articles**, **2 audits**, **12 public pages**, and **6 prop-firm records**. The extra `articles/template.html` source file is a non-public template and is intentionally excluded from imported or indexed content.

> Do not run the generated SQL with a broad database user outside a controlled migration. The Supabase migrations are the audit trail for the production schema and imported editorial data.

To provision the first administrator, create the account with Supabase Auth, wait for the `profiles` trigger to create its profile row, then promote only that UUID through a controlled administrator operation. The application never stores editorial passwords in Prisma or source control.

## Search contract

`GET /api/search` accepts `q` (2–100 characters), `type` (`all`, `article`, `audit`, or `prop-firm`), `limit` (1–20), and `page` (1–1000). It returns `page`, `limit`, `hasMore`, and a bounded `results` array. `category` is an optional article-category slug: when supplied with `type=all`, the service safely limits the search to articles rather than mixing audits or firms outside that category.

The user-facing `/search` utility is intentionally excluded from the XML sitemap and carries `noindex, nofollow`; query URLs must not become crawl destinations.
