# Task: Nuxt UI Page Migration — Agent Instructions

Redesign an existing `apps/frontend` page against a design prototype, using Nuxt UI.

## Inputs (fill these in per task)

| Input | Notes |
|---|---|
| **Page** | route + file, e.g. `/profile/contribution` → `apps/frontend/src/pages/profile/contribution.vue` |
| **Prototype** | Claude design artifact / screenshot / URL — the visual target |
| **Scope** | opt: sub-sections to skip, or "page only, leave child components" |

Everything below is standing convention — don't restate it in the task prompt.

## Reference pages (already migrated — match these)

Sidebar — `layouts/menu/TheMenu.vue` | Account — `pages/profile/account.vue` + `components/pages/profile/account/*` | CrowdNewsroom list — `pages/crowdnewsroom/index.vue` + `components/callout/CalloutCard.vue`, `CalloutArchivePanel.vue`, `CalloutArchiveRow.vue`, `CalloutMetaList.vue`

Nothing else is migrated — the rest of `components/callout/` is still legacy. Check for `.nuxt-page` / `U*` usage before treating any other file as a reference.

Read the closest one before starting. Consistency with these beats fidelity to the prototype where they disagree.

**Keep this list current:** the migration PR that finishes a page adds that page here, in the same PR.

## Rules

**Components:** Nuxt UI (`U*`) first | Only `App*` components from `packages/vue/src/components/nuxt-ui/` (import from `@beabee/vue`) — every other `App*` is legacy, never use on a migrating page | New shared components go in that folder + `.story.vue` + `.story.md` + regenerate index (`yarn generate:index`) | Page-specific components stay in `apps/frontend/src/components/pages/...`

**Styling:** Apply `.nuxt-page` to the page root | Check `apps/frontend/src/index.css` for what `.nuxt-page` already sets before adding classes (`p` → `text-sm`; `h2`,`h3` → `text-highlighted text-base font-semibold`) — don't re-apply | No legacy classes (`.content-message`, `.formio-*`, old design-system classes) — plain Tailwind utilities or arbitrary variants (`[&_p]:text-base`) instead | `text-sm` is the default floor for body/secondary text; use `text-xs` sparingly | Section heading `text-base font-semibold text-highlighted` | Help/secondary `text-sm text-muted` | Input label `text-sm font-medium text-default` (`text-toned` is *not* gray-700) | Radius comes from `--ui-radius` — don't set `rounded-*` to fake it

**Nuxt UI config:** Global component tweaks belong in `packages/vue/src/lib/nuxt-ui.config.ts`, not inline `:ui` overrides on one page | Avoid customising `U*` internals beyond what's already there — if the prototype demands it, ask

**Forms:** `UForm` + `UFormField` + schema validation, per `AccountForm.vue` / `ChangePassword.vue` | No Vuelidate on new Nuxt UI pages

**Copy:** Match the prototype's wording | Never edit an existing locale string — `apps/frontend-old` still uses it | New concept → new plain key | Reworded existing key still used by `frontend-old` → same key name + `-nuxt` suffix | Add to `packages/locale/src/locales/en.json` (+ `template.json`) only; other languages are translated elsewhere

**Imports:** `#components/`, `#utils/`, `#store/`, `#type` aliases | `@beabee/vue` for shared components | `@beabee/beabee-common` for shared types

**Types:** No inline interfaces in `.vue` files — `apps/frontend/src/type/`, `packages/vue/src/types/`, or `packages/common/src/types/` per CLAUDE.md

## Ask before

Any logic change beyond render/layout (data fetching, API calls, routing, permissions) | Introducing a shared CSS class or global `nuxt-ui.config.ts` change | Adding a dependency | Deleting or reorganising a component other pages use | Starting a preview or dev server (`frontend`, `vue-histoire`) — never launch one unprompted | Dropping a feature the prototype omits (prototypes are illustrative, not a spec — the prototype missing something is not permission to remove it)

## Workflow

Build **bottom-up**: blocks first, each reviewed in a sandbox, page assembled last. Never build the whole page and then show it.

### 1. Read

Current page + its child components | closest reference page | the prototype.

### 2. Propose a block inventory — then stop and wait

Break the prototype into blocks and post a table. A "block" is any visually distinct unit, whether or not it becomes a component:

| Block | Lives in | States | Data |
|---|---|---|---|
| Amount picker | inline | default, custom amount, invalid | local state |
| Contribution summary | `components/pages/profile/contribution/` | active, cancelled, none, loading | `client.contact.contribution` |
| Payment method row | `components/payment/` | card, direct debit, missing | prop |
| Sticky save bar | `nuxt-ui/` | idle, dirty, saving | prop |

**Lives in:** `inline` — markup in the page file (default) | `components/pages/<route>/` — one page only, but big or stateful (`AccountForm.vue`, `ContributionBox.vue`) | `components/<domain>/` — reused across pages (`callout/CalloutCard.vue`) | `packages/vue/src/components/nuxt-ui/` — app-independent, no API/store, needs `.story.vue` + `.story.md`

Default to `inline`, then the narrowest folder that fits. Prefer promoting later over guessing now.

**States:** enumerate exhaustively — loading, empty, error, permission-denied, long text/overflow, mobile. A block with one state is suspicious; say so if it's genuinely one.

Wait for approval or edits to the table before writing code. This is the main gate — everything after it is mechanical.

### 3. Per block: build → sandbox → review → next

One block at a time, in table order:

1. Build it with mock/static data — no API wiring yet.
2. Write **every state from the table at once**, labelled, into a sandbox:
   - `nuxt-ui/` → `.story.vue` alongside it, one variant per state (view via `vue-histoire`, port 6006)
   - everything else → `apps/frontend/src/pages/_sandbox.vue` (`noAuth: true`, `.nuxt-page` root, static props, states stacked with `<h2>` labels — see `_theme.vue` for the pattern), at `/_sandbox` (`frontend`, port 3010). Untracked via `.git/info/exclude` — it persists locally between migrations, so rewrite it freely and never `git add -f` it.
3. Say it's ready and name the URL. **Don't start a dev server or browser preview, and don't screenshot, unless asked** — assume the user is already running it and will look themselves.
4. Wait for sign-off, then move to the next block. Don't batch blocks past a pending review.

### 4. Assemble

Drop reviewed blocks into the page, wire real data, handle real loading/error states. Report it's ready for review at the real route — again, no preview or screenshot unless asked.

### 5. Clean up + verify

Add the migrated page to **Reference pages** above | Leave `_sandbox.vue` as it is (untracked, invisible to git) — but drop its entry from `src/typings/typed-router.d.ts`, which is tracked and regenerated by the dev server | Delete components the migration orphaned (grep first; `apps/frontend-old` has its own copies, so it isn't affected) | keep `.story.vue` files for `nuxt-ui/` blocks | `yarn generate:index` if `nuxt-ui/` gained components | `yarn format && yarn check` | ask before committing.

## Done when

Every block in the inventory built and signed off | `.nuxt-page` applied, no redundant or legacy classes | No non-`nuxt-ui` `App*` imports left on the page | Existing locale strings untouched | Loading/empty/error states handled | Responsive + keyboard-accessible | `yarn check` clean | `nuxt-ui/` blocks have stories
