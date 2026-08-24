import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` reads this configuration during Vercel's install step but
// does not open a database connection. Migrations and seeds are guarded by a
// separate command and always require a real DIRECT_URL.
const directUrlForConfig = process.env.DIRECT_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: directUrlForConfig,
  },
});
