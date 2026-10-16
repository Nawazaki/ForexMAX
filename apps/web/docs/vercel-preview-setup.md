# Vercel Preview setup

This is a Preview-only deployment checklist. It does not authorize changing the Production branch, production environment variables, domains, DNS, database, or deployments. No deployment or Vercel project setting is changed by following this document unless an operator performs the steps below.

## Vercel project settings

| Setting | Location | Required value |
|---|---|---|
| Root Directory | `Project → Settings → General → Root Directory` | `apps/web` |
| Framework Preset | `Project → Settings → General → Build & Development Settings` | `Next.js` (auto-detected) |
| Install Command | `Project → Settings → General → Build & Development Settings` | `pnpm install --frozen-lockfile` |
| Build Command | `Project → Settings → General → Build & Development Settings` | `pnpm build` |
| Production Branch | `Project → Settings → Git` | Leave unchanged. Never set an improvement or migration branch as Production. |

The repository has no root `package.json`; configure `apps/web` as the Root Directory. The install and build commands are also declared in `vercel.json`.

## Database isolation is mandatory

Before configuring Preview variables, provision or identify a **dedicated Supabase Preview project** (expected project name: `ForexMax-Preview`). The project reference and connection hosts must be verified against the Preview project by an authorized operator. Do not reuse a Production project's URL, publishable key, or database connection strings for Preview.

Set these variables in Vercel's **Preview** scope only, using values from that dedicated Preview project:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma runtime queries, using the Preview project's supported pooler. |
| `DIRECT_URL` | Prisma CLI migrations and controlled seed operations, using the Preview project only. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase SSR auth and Storage client for Preview. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Preview project's publishable key. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL setting. Review SEO/noindex behavior for Preview before enabling a deployment; never use a Preview URL as the Production canonical. |

Do not paste connection strings, passwords, or keys into source control, tickets, or chat. Before any migration or seed operation, independently verify that **both** `DATABASE_URL` and `DIRECT_URL` point to the dedicated Preview project. Never run destructive resets, `prisma migrate dev`, or arbitrary seeds against Production. Keep database writes blocked until Preview isolation and authorization are verified.

## Create and verify a Preview deployment

1. Confirm the Git branch is non-Production and the Production Branch setting remains unchanged.
2. Confirm the Vercel deployment will use the Preview environment and only Preview-scoped variables.
3. Create a Preview deployment from the explicitly selected branch; do not promote it to Production.
4. Verify the deployment is labeled **Preview**, its source branch and commit are expected, and Preview indexing is appropriately disabled.
5. Verify application logs and routes without performing database writes unless the isolated Preview database has been independently verified and the operation is authorized.

This guide intentionally does not name a branch or minimum commit: those values change over time and must be selected and verified for each deployment.
