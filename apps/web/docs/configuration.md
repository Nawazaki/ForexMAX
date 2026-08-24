# Required production configuration

| Variable | Used by | Handling |
|---|---|---|
| `DATABASE_URL` | Prisma application queries | Use the Supabase transaction pooler; configure in Vercel only. |
| `DIRECT_URL` | Prisma CLI migrations and controlled seed operations | Use the Supabase session pooler/direct connection; configure in Vercel only. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase SSR browser and server clients | Public project URL; do not hardcode it in source. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase SSR browser and server clients | Publishable key only; it is safe for the browser when RLS remains enabled. |
| `NEXT_PUBLIC_SITE_URL` | Canonical metadata and production URLs | Set to the verified production domain at cutover. |
| `BOOTSTRAP_ADMIN_ID` | Controlled profile promotion during seed | A Supabase Auth UUID, never a password or email credential. |

The repository does not store connection strings, passwords, or service keys. Prisma CLI commands expect `DIRECT_URL`; the application runtime expects `DATABASE_URL` through the Supabase pooler.

```bash
pnpm db:generate
pnpm seed:sql
```

Apply schema and seed SQL to Supabase only through the controlled migration workflow. Supabase Auth owns passwords and sessions; the `profiles` table records editorial roles. Supabase Storage owns image bytes; the application records only media metadata and object paths in PostgreSQL.

For API filtering, pagination, and search-indexing behavior, see [Supabase operations](./supabase-operations.md#search-contract).
