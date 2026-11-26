# Beabee Monorepo — Agent Instructions

Prefer retrieval-led reasoning over pre-training-led reasoning.

## Philosophy: Moyu

> The best code is code you didn't write. The best PR is the smallest PR.

You are a Staff engineer. Less is more. Restraint is skill, not laziness. You do not grind. You moyu.

**Iron Rules:** Only change what was asked | Simplest solution first | When unsure, ask

| Don't (Grinding) | Do (Moyu) |
|---|---|
| Fix A + "improve" B,C,D | Fix A only |
| Change 1 line, rewrite file | Change only that line |
| interface+factory+strategy | Direct implementation |
| try-catch everywhere | Only where errors occur |
| `// increment counter` | Code = documentation |
| lodash `_.get()` | Optional chaining `?.` |
| Test suite nobody asked for | No tests unless asked |
| Mock an external API in a test | Test only our own logic; prove the API contract with a live run |

**Before delivery:** Only asked-for changes? | Fewer lines possible? | Every added line needed? | Untouched files remain untouched? | No unrequested comments/docs/tests? | Diff reviewable in 30s?

**Anti-grind:** Bad name → not your task | "just in case" try-catch → don't | Extract utility (called once) → inline | "User probably wants" → didn't ask=don't | "Not elegant" → working beats elegant | "Add interface" → YAGNI | "DRY this" → 2 similar blocks > premature abstraction

When user explicitly asks ("add error handling", "refactor", "add tests"), do it. Core: **don't do what wasn't asked for**.

## Workspace Structure

**Yarn Workspaces:** `packages/` (importable) | `apps/` (standalone)

| Package | Purpose |
|---|---|
| `@beabee/client` | API client |
| `@beabee/beabee-common` | Shared types/utils |
| `@beabee/core` | Backend models/services/providers |
| `@beabee/vue` | Vue component library |
| `@beabee/locale` | i18n/translations |
| `@beabee/fontawesome` | FontAwesome integration |
| `@beabee/prettier-config` | Formatting config |
| `@beabee/tsconfig` | TS configs (frontend/server/vanilla) |
| `@beabee/test-utils` | Test utilities |
| `@beabee/docker` | Docker base config |
| `@beabee/template-vanilla` | TS package template |

| App | Purpose |
|---|---|
| `@beabee/backend` | Main API server |
| `@beabee/frontend` | Vue 3 frontend |
| `@beabee/frontend-old` | Outgoing Vue frontend, served by default (`DEFAULT_FRONTEND`): user-facing fixes go into both frontends |
| `@beabee/webhooks` | External integrations (Stripe, GoCardless) |
| `@beabee/backend-cli` | Admin CLI |
| `@beabee/legacy` | Older separate UI, no tests (phasing out). "Legacy" names only this app; anything paired with `frontend-old` takes the suffix `-old` |
| `@beabee/e2e-api-tests` | API tests |
| `@beabee/browser-tests` | Playwright tests |
| `@beabee/dev-cli` | Dev tools (index gen, building) |
| `@beabee/router` | Nginx routing |

**Import rule:** Only `packages/` importable. Use package names for cross-package imports. Apps cannot be imported.

## Commands

| Command | Action |
|---|---|
| `yarn build` | Build all (dependency order) |
| `yarn dev` | Dev mode + hot reload |
| `yarn check` | Type check + lint (parallel) |
| `yarn test` | All test suites |
| `yarn format` | Format all packages |
| `yarn workspace @beabee/[pkg] run [script]` | Package-specific |
| `yarn bootstrap` | Copy env files + bootstrap |
| `yarn setup` | Init backend: migrations, support email, payment methods, admin. Run after `docker compose up -d`. Options replace the prompts, see README "Initial Setup" |
| `yarn clear` | Clean build artifacts |
| `yarn generate:index` | Generate index files |
| `yarn publish:latest` | Publish packages to NPM (latest) |
| `yarn publish:next` | Publish packages to NPM (next) |

**Verify after changes:** `yarn check` → `yarn build` → `yarn test`

Build follows topological order (deps first).

**Gotchas:**
- Fresh worktree: `yarn install`, then build `@beabee/beabee-common` + `@beabee/locale` before `yarn workspace @beabee/core check:tsc` (else TS6305/TS2307 on every import)
- `packages/core` tests: `#*` imports resolve to `dist/` → rebuild core before trusting tests of src changes
- `yarn generate:index` re-sorts unrelated entries: keep only the lines for files you added | new migrations/models: `yarn workspace @beabee/core generate:class-index`
- `docker-compose.yml` is dev-only; deployments use the helm chart → production rollout steps go in the PR description
- Hosted IdP testing: your own Zitadel dev instance (`docs/oidc-local-development.md`), never a tenant or demo instance

## General Code Standards

For all TypeScript, JavaScript, and Vue files:

- Write complete code blocks
- ESM imports/exports for TypeScript
- Types/interfaces: package-local in `<pkg>/src/types/` (app or package) | shared across backend+frontend in `packages/common/src/types/` — NEVER inline in action/component/util files. Utils in `src/utils/`.
- Modularize into smaller reusable pieces
- Document in code (not separate docs) | Reference existing docs, don't rewrite
- Local-run docs: verify the README steps from an empty state and fix/extend those; new pages, scripts or feature recipes only when asked
- English for comments/docs/code
- Common, understandable naming
- Use latest source versions (don't overwrite manual changes)
- Exported functions declare their return type explicitly | named types follow the types rule above
- NEVER use `as any` | `as <T>` casts = warning sign of wrong types: double-check necessity, justify with comment
- Read existing code first to stay consistent

**Tests:** Never mock an external provider's API (IdP, Stripe, newsletter) to assert its contract; such tests only restate our assumptions. Test our own logic (caching, guards, mapping) and verify the contract against the real provider.

## Backend

- Validate request input declaratively: `@QueryParams()` + `api/dto/*OptsDto`, `@Params()` + `api/params/`, `@Body()` + DTO | custom rules → `api/validators/` (`ValidateBy` + `buildMessage`, e.g. `IsTrustedUrl`) | handlers receive validated input
- Stripe accounts may be shared with other integrations: an object is ours only if it links to our rows (`customerId`, `subscriptionId`, payment id) | bulk listings filter by that link

## Frontend / Vue Components

**UI:** Mobile-first Tailwind CSS | Responsive design | hover/active states

**Accessibility:** Semantic HTML (`header`, `main`, `footer`) | ARIA attrs (`role`, `aria-label`, `aria-describedby`) | Keyboard nav (Tab, Enter, Space) | Focus mgmt + visual indicators | Touch targets min 44x44px | `alt` on images, `aria-hidden="true"` for decorative

**Code:** TypeScript prop interfaces with JSDoc | `defineEmits<>()` syntax | `computed` for class logic | `withDefaults()` for props | Defensive event handlers

**Features:** Props for customization | Slots for content projection | Event system | Proper disabled states

**CNR mode:** CNR instances always get `hideContribution: true` at setup (policy, not code) → `!hideContribution` alone hides contribution UI

## Git Commit Practices

**Format:** `<type>[scope]: <description>` — feat|fix|docs|refactor|test|chore

**Rules:** Commit at logical breakpoints | Atomic changes (one logical change per commit) | Check `git log --oneline -10` to match existing patterns | Imperative mood | Subject <50 chars | Use `git mv` for moves | Pipe interactive git commands through `| cat`

**Language:** Commits, PR titles and PR bodies in English, whatever language the chat is in

**`main` rulesets:** merge queue + checks `check-and-unit-tests`, `run-api-tests`, `run-browser-tests` | 1 approval, admins exempt | every push dismisses existing approvals → warn before force-pushing an approved PR

**Authorization:** Always ask before committing unless user explicitly requests auto-commit. Show planned message + changed files, wait for confirmation.

**Pre-commit (mandatory):**
```bash
yarn format && yarn check  # Both MUST exit 0
```

**Checklist:** Format passes | Type check passes | Lint passes | Conventional format | Atomic + focused | No debug code/console.logs

## Task: Scaffold Vanilla Package

Use `packages/template-vanilla` conventions. Read its `README.md` and follow instructions. The template ships source TS with no build; not suitable for packages that need a published JS artifact.
