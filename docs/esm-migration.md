# ESM Migration Plan

This document describes the migration of the beabee monorepo from a hybrid CommonJS/ESM setup to a uniform ESM setup. It is intended as a transparent reference for contributors and reviewers and is removed once the migration is complete.

> **Status:** in progress, split across three PRs (Foundation → Core+Apps → Cleanup).

## Goals

- Run beabee fully on ESM. No CommonJS support anywhere.
- Remove dual CJS/ESM builds from published packages.
- Drastically simplify the build/dev tooling. In particular, eliminate per-package watch builds.
- Workspace packages export their TypeScript source directly. Apps that need a build (because of decorators) build themselves with `tsc` and resolve workspace packages from source via `tsconfig` `paths`.
- Published packages (currently `@beabee/common`, `@beabee/client`, `@beabee/locale`; eventually `@beabee/core`) keep producing a clean ESM build for npm consumers, gated by `publishConfig` in `package.json`.

## Background

Today the monorepo is in a hybrid state:

- `@beabee/core` and three apps (`backend`, `webhooks`, `legacy`) ship as CommonJS.
- `backend-cli` and all packages other than `core` are already ESM.
- `@beabee/common` and `@beabee/client` produce dual builds (CJS + ESM via esbuild).
- `@beabee/locale` builds CJS only and exports source TS for ESM consumers.

This results in:

- Per-package `tsc --watch` pipelines for app dependencies (slow, fragile).
- Complex esbuild orchestration with dual `dist/cjs/`, `dist/esm/`, `dist/types/` outputs.
- Several CommonJS-specific footguns: TypeORM glob entity loading via `__dirname`, `require.resolve` inside a migration, two `.js` CJS utility scripts, `createRequire` used in a Vite config.

## Build tool decision

Investigation revealed that **esbuild and tsx cannot reliably emit `emitDecoratorMetadata`**. The backend stack (`routing-controllers` 0.10.4, `typeorm` 0.3.27, `class-validator` 0.14.1) requires legacy decorator metadata, and there are no stable releases of these libraries supporting TC39 standard decorators yet. For this reason:

| Area | Tool | Reason |
| --- | --- | --- |
| `apps/backend`, `apps/webhooks`, `apps/legacy`, `apps/backend-cli` | `tsc` for build, `tsc --watch` for dev | Decorator metadata is required; `tsc` is the gold standard |
| `apps/frontend` | Vite (unchanged) | No backend-style decorators |
| `packages/common`, `packages/client`, `packages/locale` | esbuild build (ESM-only) | No decorators, esbuild is ideal here |
| `packages/core`, `packages/vue`, `packages/fontawesome`, `packages/test-utils`, `packages/esbuild` | No build (source TS export) | Internal-only, or publish-capable later via `publishConfig` |

The simplification benefit is preserved because:

- Per-package watch builds disappear. Apps' `tsconfig` `paths` point to `packages/*/src/`, so a single `tsc --watch` of an app picks up source changes directly.
- Dual builds disappear for published packages.
- `dist/cjs/`, `dist/esm/`, and `dist/types/` collapse into a single flat `dist/` with `.js` and `.d.ts` next to each other.

If `routing-controllers` / `typeorm` ever ship stable TC39 decorator support, a follow-up PR can swap `tsc` for esbuild on the backend side.

## PR breakdown

### PR1 — Foundation (non-breaking)

Adds tooling and additive `package.json` fields without flipping anything yet. The repo behaves exactly as before after this PR.

- `packages/tsconfig/tsconfig.server.json`: set `module` and `moduleResolution` explicitly to `NodeNext`. Decorator metadata flags stay.
- `apps/dev-cli/src/actions/generate-class-index.ts` (new): generic helper that scans a directory and writes an index file with explicit `import { X } from './path/X.js'` plus an aggregated `export const ... = [...]` array. Two strategies: class name matches file name or class name parsed from `export class (\w+)`. Used by core for TypeORM `entities.ts` / `migrations.ts`.
- `apps/dev-cli/src/actions/typeorm-migration-generate.ts` (new): wraps `typeorm migration:generate` and re-runs the index generator afterwards. Eliminates the "forgot to regenerate the index" failure mode.
- `apps/dev-cli/src/commands/`: register both new commands. `migration:run` and `migration:revert` keep using the TypeORM CLI directly (no index refresh needed).
- `packages/core/package.json`: add `generate:typeorm-index` and `migration:generate` scripts. The existing barrel `generate:index` script is untouched.
- `docs/esm-migration.md` (this file): commits this plan into the repo.

The `publishConfig` switch on `packages/common`, `packages/client`, `packages/locale` happens together with the dual-build cleanup in PR3, since adding `publishConfig` ahead of time would either be a no-op or accidentally change what gets shipped to npm.

Verification: `yarn check`, `yarn build`, `yarn test` continue to pass.

### PR2 — Core + apps ESM flip (atomic)

The semantic core of the migration. Has to land as a single PR because `@beabee/core` and its four consumers (`backend`, `webhooks`, `legacy`, `backend-cli`) flip together.

`packages/core`:

- `"type": "commonjs"` → `"module"`.
- `imports`/`exports` rewritten from `./dist/*.js` to `./src/*.ts` (source-TS export).
- Drop `main`, `module`, `build`/`watch` scripts, `files: ["dist/"]`. No more dist artefact.
- `tsconfig.build.json` deleted/reduced — `tsc` only used for `check:tsc`.
- `src/database.ts`: replace the `__dirname + '/models/*.js'` glob with `import { entities } from './entities.js'` and analogously `migrations`. The two index files are generated by the dev-cli helper.
- `src/services/EmailService.ts`: replace `__dirname` with `path.dirname(fileURLToPath(import.meta.url))`.
- `src/migrations/1616677358190-SessionTable.ts`: replace `require.resolve` with `createRequire(import.meta.url).resolve(...)`.

Apps (`apps/backend`, `apps/webhooks`, `apps/legacy`, `apps/backend-cli`):

- Flip `"type"` to `"module"`. (`backend-cli` already is.)
- Rewrite `imports` block (`#core/*`, `#api/*`, …) from `./dist/*.js` to `./src/*.ts`.
- Update `tsconfig.build.json` `paths` so `@beabee/core` etc. resolve to `packages/*/src`. This is what removes the need for per-package watch builds.
- Build still happens via `tsc`, but now emits ESM (`module: NodeNext` is inherited from the updated server preset).
- Make `import 'reflect-metadata'` the very first statement in every entrypoint.
- Two CommonJS utility scripts at `apps/backend/src/tools/gocardless/{fetch-customer.js,fetch-data.js}` are converted to ESM imports.
- `apps/backend/package.json` `typeorm` script updated to point at the new ESM build output (or at source TS).

Verification: `yarn check`, `yarn build`, full TypeORM migration run, smoke test of the API endpoints that depend on routing-controllers / class-validator metadata, end-to-end API tests via the existing Docker setup.

### PR3 — Published packages cleanup

Removes the last vestiges of CJS and the dual-build infrastructure.

- `packages/common`, `packages/client`, `packages/locale`: drop `dist/cjs/`, drop separate `dist/esm/` and `dist/types/`. Final shape — a single flat `dist/` with `.js` next to `.d.ts`. The `package.json` follows this canonical pattern:

  ```jsonc
  {
    "type": "module",
    "main": "./src/index.ts",
    "types": "./src/index.ts",
    "exports": {
      ".": "./src/index.ts",
      "./package.json": "./package.json"
    },
    "files": ["dist/", "src/"],
    "publishConfig": {
      "main": "./dist/index.js",
      "types": "./dist/index.d.ts",
      "exports": {
        ".": {
          "types": "./dist/index.d.ts",
          "default": "./dist/index.js"
        },
        "./package.json": "./package.json"
      }
    },
    "scripts": {
      "build": "yarn dev-cli start esbuild",
      "prepublishOnly": "yarn clear && yarn build"
    }
  }
  ```

  Local consumers in the workspace see source TS via `exports` → `./src/index.ts`. `npm publish` swaps in the `publishConfig` block so consumers on npm get a flat `dist/`.

- `packages/esbuild`: `buildCJS`/`buildStandard` removed. `buildESM` writes flat `.js` and triggers a `tsc --emitDeclarationOnly` declaration pass into the same directory.
- `packages/weblate-client`: removed (verified unused across the workspace).
- `packages/tsconfig`: `tsconfig.vanilla.json` consolidated into `tsconfig.server.json` if the differences are minimal post-flip.
- Documentation sweep: `README.md`, `CLAUDE.md`, `AGENTS.md`, package READMEs, app READMEs all updated to describe the new ESM-only flow.
- This file (`docs/esm-migration.md`) is deleted as part of the cleanup.
- `.gitignore` simplified to a single `dist/` rule.

Verification: `yarn pack` on each published package shows a clean ESM-only tarball with `.d.ts` next to `.js`. `npm publish --dry-run` confirms `publishConfig` swap. `grep -rE "CommonJS|CJS|dual.build|dist/cjs|dist/esm|dist/types" *.md docs/ packages/*/README.md apps/*/README.md` returns nothing meaningful.

## Risks

| Risk | Mitigation |
| --- | --- |
| TypeORM index drift after a manually-added migration | The `migration:generate` wrapper in dev-cli regenerates the index automatically. CI runs the `generate-class-index --check` mode as a safety net. |
| `__dirname` / `require` / `require.resolve` left over | Pre-merge grep across `packages/core`, `apps/backend`, `apps/webhooks`, `apps/legacy`, `apps/backend-cli`. |
| `reflect-metadata` import order regressions | Lint rule `import/first`; runtime assertion `Reflect.getMetadata !== undefined` on boot. |
| Subpath `imports` (`#*`) typos | Smoke-test boots all four apps in CI / locally. |
| Legacy Gulp pipeline breaks under ESM | If `gulpfile.ts` rejects ESM, drop a `gulpfile.mjs` shim. Gulp 4 supports ESM. |
| `yarn typeorm` CLI invocation breaks because `dist/` is gone | The `typeorm` script is updated to point at the ESM build output (or via `--loader tsx` directly to source). Verified during PR2 smoke test. |
| `connect-pg-simple/table.sql` cannot be located | `createRequire` pattern is robust; explicitly re-run the SessionTable migration during PR2 verification. |

## Developer experience after migration

Before:

- `yarn dev` spawns a `tsc --watch` per package (one for `core`, one each for `common`, `client`, `locale`, plus per-app watchers). A change in `packages/core/src/foo.ts` propagates: core watcher rebuilds → backend watcher picks up `dist/foo.js` → restart.
- Local edits in `common`/`client` require a build step before the frontend sees them.

After:

- `yarn dev` spawns a single watcher per app (`tsc --watch` for backend-style apps, Vite for the frontend, Vitest for the e2e tests). A change in `packages/core/src/foo.ts` is picked up directly via `paths` — one rebuild of the consuming app.
- Frontend sees `common`/`client` changes immediately (Vite resolves source TS). Backend sees them on the next app rebuild.
- `npm publish` runs `prepublishOnly`, producing a clean ESM-only distribution from the published packages.
