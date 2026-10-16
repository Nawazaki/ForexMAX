# ForexMAX project owner report

**Updated:** 2026-10-16 16:12 CET (Africa/Algiers)

**Branch:** `improvements/forexmax-hardening-2026-10-16` (local only; no remote branch yet)

**Production changes:** None. No deployment, database writes, credential access, push, or pull request has occurred.

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

- GitHub authentication is available. The improvement branch is local only and has not yet been pushed; GitHub reported 404 when the branch was queried.
- Before adding the application workflow, the repository listed only the SLSA generic generator and GitHub Pages deployment workflows. The new validation workflow is staged locally but has not yet run.
- Docker, Podman, and `act` are not installed locally. The Codespaces API returned HTTP 403 because the current GitHub token lacks the `codespace` scope; no scope refresh was requested.
- The branch-specific Vercel deployment guard prevents an unverified Preview deployment when the CI branch is pushed. No Preview or Production deployment has occurred.

## Remaining validation and safety boundaries

1. Push the authorized improvement branch to trigger the Node 22 Linux workflow, then review and fix any failures and repeat until typecheck, lint, tests, and production build pass.
2. Review the generated Prisma output before any eventual merge; it is a `postinstall` artifact from the existing schema. No schema migration, seed, or database operation was run.
3. Before enabling Preview deployments or any database write, independently verify the dedicated `ForexMax-Preview` project and both Preview database URLs. Production has not been modified.
4. Source management, evidence, editorial review, and persisted research remain disabled/read-only pending verified Preview isolation, auth/RLS/storage validation, and a documented manual source-to-public-page acceptance test.
5. Do not describe ForexMAX as production-ready unless the hosted test suite and production build pass and the remaining operational requirements are reviewed.
