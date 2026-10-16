# ForexMAX project owner report

**Updated:** 2026-10-16 16:35 CET (Africa/Algiers)

**Branch:** `improvements/forexmax-hardening-2026-10-16` (pushed to `origin`; validation completed at `c4cfa4d`)

**Production changes:** None. No deployment, database writes, credential access, or pull request has occurred.

**Validation status:** Hosted Ubuntu 24.04 / Node 22 typecheck, lint, tests, and production build all passed. Preview isolation and remaining operational acceptance checks are still unverified, so ForexMAX is not declared production-ready.

## Completed changes

- Replaced the generic Next.js starter README with ForexMAX-specific app structure, pinned package-manager instructions, commands, and database-safety guidance (`apps/web/README.md`).
- Rewrote the Preview runbook to require a dedicated Supabase Preview project, Preview-scoped credentials, and independent verification of both database URLs (`apps/web/docs/vercel-preview-setup.md`).
- Updated the Preview-isolation TODO and removed duplicated completed entries (`todo.md`).
- Fixed `/api/search` global pagination using per-type counts and global page windows, with deterministic order within each type. Added route regression coverage spanning articles, audits, and prop firms (`apps/web/src/app/api/search/route.ts`, `route.test.ts`).
- Darkened the shared accent to `#8c5c12` and added a CSS-token contrast regression test. Measured ratios are 5.08:1 on canvas, 5.54:1 on paper, 4.74:1 on the research notice surface, and 5.48:1 on the admin card surface (`apps/web/src/app/globals.css`, `apps/web/src/lib/accessibility.test.ts`). Review caught a malformed hex-digit matcher in the test; it was corrected and Node confirmed all tested colors parse.
- Replaced the static JSON import in `next.config.ts` with filesystem loading. The config now loads successfully in the installed Node/Next environment; the normal build proceeds to a platform-level Turbopack failure.
- Added `.github/workflows/validate-web.yml` to run locked install, typecheck, lint, tests, and production build on Ubuntu with Node 22 and pnpm 11.21.0 for pushes, pull requests, and manual dispatch.
- Disabled Vercel Git deployments for this exact improvement branch in `apps/web/vercel.json`. This allows GitHub CI without starting an unverified Preview deployment before Preview database isolation is confirmed.
- Read the installed Next.js Route Handlers, CSS, and configuration guides before making application changes.

## Diff review

- The application and documentation diff was reviewed. The pagination implementation preserves article → audit → prop-firm ordering, slices the global page across model counts, and uses stable per-model ordering. Category-filtered `type=all` remains article-only. No unrelated source or documentation changes were identified.
- The regenerated Prisma output was compared with `prisma/schema.prisma`, `prisma.config.ts`, and the pinned Prisma version. The 15 added model modules correspond to schema models; updated enums, model metadata, delegates, and relations match the schema. No unrelated generated modules or substantive unrelated generated-code changes were identified. Trailing whitespace from generation was normalized in generated files.

## Dependency and local validation results

- `pnpm install --frozen-lockfile --fetch-timeout=180000 --fetch-retries=5 --network-concurrency=4 --reporter=append-only`: **passed**, completed in 6m 23.2s using pnpm 11.21.0. All 558 packages were added (554 reused, 4 downloaded). A transient Next.js tarball error 23 was retried successfully.
- `pnpm-lock.yaml` and `package.json`: unchanged.
- `pnpm run typecheck`: **passed** after the final code and regression-test changes.
- `pnpm run lint`: **passed** after the final code and regression-test changes.
- `pnpm run test`: **not executed**. Vitest startup fails because this Android ARM64 install lacks `@rolldown/binding-wasm32-wasi` and `rolldown-binding.wasi.cjs`.
- `pnpm run build`: **not completed**. Next.js loads `next.config.ts`, then reports that Turbopack is unsupported on Android ARM64 with only WASM bindings available.
- `pnpm exec next build --webpack`: **not completed**. Webpack cannot load `lightningcss.android-arm64.node` while processing CSS.
- `git diff --check`: **passed**. The owner report also passed its no-index whitespace check.

The Prisma install scripts warn that Prisma 7.9.1 supports Node.js 20.19+, 22.12+, and 24.0+, while this environment is Node `v26.3.1`; they also identify the OS as unknown Android and default to Linux. Prisma client generation completed successfully. This environment is not suitable for the requested Node 22/Linux validation.

## Hosted CI status

- Pushed `improvements/forexmax-hardening-2026-10-16` to `origin` and ran [GitHub Actions run 38925000531](https://github.com/Nawazaki/ForexMAX/actions/runs/38925000531) on Ubuntu 24.04 with Node 22 and pnpm 11.21.0. **Passed**: frozen dependency install, typecheck, lint, Vitest suite, and production build.
- The Vercel branch guard worked as intended: GitHub's deployments API returned zero deployments for this branch. No Preview or Production deployment has occurred.
- GitHub emitted a non-failing warning that `actions/checkout@v4`, `actions/setup-node@v4`, and `pnpm/action-setup@v4` target Node 20, which is deprecated for Actions and was forced to Node 24. The workflow itself ran application validation on Node 22. GitHub also noted `ubuntu-latest` will migrate to Ubuntu 26 on October 19, 2026.
- Docker, Podman, and `act` are not installed locally. The Codespaces API returned HTTP 403 because the current GitHub token lacks the `codespace` scope; no scope refresh was requested.

## Remaining validation and safety boundaries

1. Hosted Node 22/Linux validation passed on the pushed commit. Re-run the workflow after any further application or workflow changes; no failure fixes were needed.
2. Review the generated Prisma output before any eventual merge; it is a `postinstall` artifact from the existing schema. No schema migration, seed, or database operation was run.
3. Before enabling Preview deployments or any database write, independently verify the dedicated `ForexMax-Preview` project and both Preview database URLs. Production has not been modified.
4. Source management, evidence, editorial review, and persisted research remain disabled/read-only pending verified Preview isolation, auth/RLS/storage validation, and a documented manual source-to-public-page acceptance test.
5. Do not describe ForexMAX as production-ready unless the hosted test suite and production build pass and the remaining operational requirements are reviewed.
