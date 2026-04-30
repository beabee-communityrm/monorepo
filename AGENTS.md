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
| `@beabee/esbuild` | Build config/plugins |
| `@beabee/docker` | Docker base config |
| `@beabee/template-vanilla` | TS package template |

| App | Purpose |
|---|---|
| `@beabee/backend` | Main API server |
| `@beabee/frontend` | Vue 3 frontend |
| `@beabee/webhooks` | External integrations (Stripe, GoCardless) |
| `@beabee/backend-cli` | Admin CLI |
| `@beabee/legacy` | Legacy frontend (phasing out) |
| `@beabee/e2e-api-tests` | API tests |
| `@beabee/dev-cli` | Dev tools (index gen, building) |
| `@beabee/router` | Nginx routing |
| `@beabee/minio` | Object storage |

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
| `yarn setup` | Init backend (admin, payments) |
| `yarn clear` | Clean build artifacts |
| `yarn generate:index` | Generate index files |
| `yarn publish:latest` | Publish packages to NPM (latest) |
| `yarn publish:next` | Publish packages to NPM (next) |

**Verify after changes:** `yarn check` → `yarn build` → `yarn test`

Build follows topological order (deps first).

## General Code Standards

For all TypeScript, JavaScript, and Vue files:

- Write complete code blocks
- ESM imports/exports for TypeScript
- Types/interfaces: package-local in `<pkg>/src/types/` (app or package) | shared across backend+frontend in `packages/common/src/types/` — NEVER inline in action/component/util files. Utils in `src/utils/`.
- Modularize into smaller reusable pieces
- Document in code (not separate docs) | Reference existing docs, don't rewrite
- English for comments/docs/code
- Common, understandable naming
- Use latest source versions (don't overwrite manual changes)
- NEVER use `as any`
- Read existing code first to stay consistent

## Frontend / Vue Components

**UI:** Mobile-first Tailwind CSS | Responsive design | hover/active states

**Accessibility:** Semantic HTML (`header`, `main`, `footer`) | ARIA attrs (`role`, `aria-label`, `aria-describedby`) | Keyboard nav (Tab, Enter, Space) | Focus mgmt + visual indicators | Touch targets min 44x44px | `alt` on images, `aria-hidden="true"` for decorative

**Code:** TypeScript prop interfaces with JSDoc | `defineEmits<>()` syntax | `computed` for class logic | `withDefaults()` for props | Defensive event handlers

**Features:** Props for customization | Slots for content projection | Event system | Proper disabled states

### New Vue Component

Templates: `packages/vue/src/components/template/` (AppTemplate.vue, index.ts)

**req:** App-independent (no API deps) | Create `.story.vue` + `.story.md` | Follow patterns in `packages/vue/src/components` | Assign to semantically appropriate dir (create if needed) | Reference existing docs, don't duplicate | Additional types in `packages/vue/src/types`

### Story Documentation (`.story.md`)

Template: `packages/vue/src/components/template/AppTemplate.story.md`

**Rules:** Minimal docs only (beyond source code) | No duplication of props/events/examples (already in interfaces/defineEmits/.story.vue) | Focus on purpose, use cases, non-obvious implementation notes

### Story Vue Files

Ref: `packages/vue/src/components/template/AppTemplate.story.vue`

- Analyze component + current usage in `apps/frontend` for context
- Create `.story.vue` + `.story.md`
- Tailwind config: `packages/vue/tailwind.config.js`
- If component can't be used standalone, don't create story

## Git Commit Practices

**Format:** `<type>[scope]: <description>` — feat|fix|docs|refactor|test|chore

**Rules:** Commit at logical breakpoints | Atomic changes (one logical change per commit) | Check `git log --oneline -10` to match existing patterns | Imperative mood | Subject <50 chars | Use `git mv` for moves | Pipe interactive git commands through `| cat`

**Authorization:** Always ask before committing unless user explicitly requests auto-commit. Show planned message + changed files, wait for confirmation.

**Pre-commit (mandatory):**
```bash
yarn format && yarn check  # Both MUST exit 0
```

**Checklist:** Format passes | Type check passes | Lint passes | Conventional format | Atomic + focused | No debug code/console.logs

## Task: Migrate Component to Vue Package

Migrate from `apps/frontend` → `packages/vue/src/components`.

**Prereq:** Identify target | Analyze current usage (context, props, interactions)

**Block:** Components using `@utils/api`, `client.ts`, API imports

**Keep:** `useI18n()` / `t()` translations | **Remove:** Direct store access (pass as props)

**Steps:** Follow new-vue-component rules + git commit practices | Clean refactor with TSDoc | Semantic HTML + ARIA | Keyboard nav | Migrate related components/utils/interfaces/types | For multiple components, apply migration iteratively

**Completion:** Update `apps/frontend` imports to `@beabee/vue` | Create wrappers for repeated prop combos | Reuse existing import declarations | Remove translation prop drilling | Run `yarn generate:index && yarn format && yarn build && yarn check` | Verify stories exist | Suggest pages/routes to test | Provide commit msg + PR description

## Task: Scaffold Vanilla Package

Use `packages/template-vanilla` conventions. Read its `README.md` and follow instructions. Not suitable for backend/CommonJS packages.

## Prompt Compression

When writing/editing AGENTS.md or agent context files:
- Pipe-delimited format for indexes/structured refs
- Single-line directives, not multi-paragraph explanations
- Strip explanatory prose — keep only actionable content
- Abbreviated keys: req|opt|str|int|bool|len|min|max|def
- Flatten nested hierarchies with brace expansion + path prefixes
- Target 70-80% token reduction preserving all actionable info
- Keep non-obvious code examples | Never compress error messages or edge case docs
