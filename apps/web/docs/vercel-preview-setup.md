# Vercel preview setup

This document applies only to the existing Vercel project `nawazakis-projects/forex-max`. It must deploy the Git branch `migration/nextjs-platform` as a **Preview**; it does not alter `main`, the production branch, domains, or production deployments.

| Setting | Exact Vercel location | Required value |
|---|---|---|
| Root Directory | `Project → Settings → General → Root Directory` | `apps/web` |
| Framework Preset | `Project → Settings → General → Build & Development Settings` | `Next.js` (auto-detected) |
| Install Command | `Project → Settings → General → Build & Development Settings` | `pnpm install --frozen-lockfile` |
| Build Command | `Project → Settings → General → Build & Development Settings` | `pnpm build` |
| Production Branch | `Project → Settings → Git` | Leave unchanged; do **not** switch it to the migration branch. |

The repository additionally contains `apps/web/vercel.json`, which pins the install and build commands in source control. Vercel still needs Root Directory configured at project level because the repository root has no `package.json`.

## Environment variable names

Add the following in `Project → Settings → Environment Variables` for **Preview** first. Do not commit or paste connection strings, passwords, or keys into source control or chat.

| Variable | Value source | Purpose |
|---|---|---|
| `DATABASE_URL` | Supabase **transaction pooler** connection on port `6543`, with `pgbouncer=true` | Prisma runtime queries. |
| `DIRECT_URL` | Supabase **session pooler/direct** connection on port `5432` | Prisma CLI migrations and controlled seed execution. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for `xvhjsbakmokmgymwrldo` | Supabase SSR auth and Storage client. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase `Project Settings → API Keys → Publishable key` | Browser and SSR auth client. |
| `NEXT_PUBLIC_SITE_URL` | `https://forexmax.com` | Canonical metadata; do not replace with a Preview URL. |

The Supabase schema and imported content already exist in the target project. Therefore a Preview must not run destructive resets, fresh `prisma migrate dev`, or arbitrary seed scripts. The verified migrations are retained in `supabase/migrations/`, and the generated idempotent content seed is retained in `supabase/seed/`.

## Preview-only deployment

After the project settings and Preview environment scope are saved, use `Project → Deployments → Create Deployment`, select `migration/nextjs-platform`, and create a **Preview**. Verify the resulting deployment is labeled Preview and that its source commit is `83d9621` or newer. Do not promote it to Production.
