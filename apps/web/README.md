# ForexMAX web application

The deployable web application is the Next.js App Router project in `apps/web/`. The repository root also contains legacy static HTML and assets; Vercel should use `apps/web` as its Root Directory.

## Toolchain

- Node.js compatible with the Next.js version declared in `package.json`.
- pnpm `11.21.0`, pinned by the `packageManager` field.

Run application commands from this directory. For a local checkout with dependencies available:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Then open `http://localhost:3000`.

## Available scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the development server. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Serve a production build. |
| `pnpm lint` | Run ESLint. |
| `pnpm typecheck` | Run TypeScript without emitting files. |
| `pnpm test` | Run the Vitest suite. |
| `pnpm db:generate` | Generate the Prisma client. |
| `pnpm db:migrate` | Deploy Prisma migrations; requires `DIRECT_URL` and changes a database. |
| `pnpm db:seed` | Run the Prisma seed; requires `DIRECT_URL` and changes a database. |
| `pnpm seed:sql` | Generate Supabase seed SQL and a report in `supabase/seed/`. |

Do not run database-changing commands against Production. Use only an explicitly isolated, non-Production database for development or Preview work. See [configuration](docs/configuration.md), [Supabase operations](docs/supabase-operations.md), and the [Vercel Preview setup](docs/vercel-preview-setup.md). Never place credentials or secret keys in source control.

## Application structure

- `src/app/` — public, admin, and API routes.
- `src/components/` — shared interface components.
- `src/lib/` — data access, source integrations, SEO, validation, and domain logic.
- `src/content/legacy-content.json` — legacy content used by migration routes and fallback rendering.
- `prisma/` and `supabase/` — data model, migrations, and generated seed artifacts.
