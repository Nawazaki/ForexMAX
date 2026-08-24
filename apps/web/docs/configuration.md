# Required production configuration

| Variable | Required for | Notes |
|---|---|---|
| `DATABASE_URL` | Prisma migrations, CMS, authentication and search | PostgreSQL connection string; it is never committed. |
| `AUTH_SECRET` | Session signing and route proxy | Generate a long random value and set it in every Vercel environment. |
| `NEXTAUTH_URL` | Credentials login callback URLs | The exact Vercel preview or production origin. |
| `BLOB_READ_WRITE_TOKEN` | Media upload | Vercel Blob token. The upload endpoint responds with a configuration error without it. |
| `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | One-time admin provisioning in `prisma db seed` | Supply only during the controlled seed operation; never commit either value. |

Run migrations and seeding only after PostgreSQL is available:

```bash
pnpm db:migrate
pnpm db:seed
```

No migration or seed is executed by this repository while `DATABASE_URL` is absent.
