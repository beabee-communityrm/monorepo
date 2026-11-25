---
name: vue-component
description: Create, document or migrate components in @beabee/vue (packages/vue). Use when adding a component to packages/vue, writing its .story.vue/.story.md, or moving a component from apps/frontend into @beabee/vue.
---

# @beabee/vue components

The general Vue rules (UI, accessibility, code, features) in AGENTS.md apply too.

## New Vue Component

Templates: `packages/vue/src/components/template/` (AppTemplate.vue, index.ts)

**req:** App-independent (no API deps) | Create `.story.vue` + `.story.md` | Follow patterns in `packages/vue/src/components` | Assign to semantically appropriate dir (create if needed) | Reference existing docs, don't duplicate | Additional types in `packages/vue/src/types`

## Story Documentation (`.story.md`)

Template: `packages/vue/src/components/template/AppTemplate.story.md`

**Rules:** Minimal docs only (beyond source code) | No duplication of props/events/examples (already in interfaces/defineEmits/.story.vue) | Focus on purpose, use cases, non-obvious implementation notes

## Story Vue Files

Ref: `packages/vue/src/components/template/AppTemplate.story.vue`

- Analyze component + current usage in `apps/frontend` for context
- Create `.story.vue` + `.story.md`
- Tailwind config: `packages/vue/tailwind.config.js`
- If component can't be used standalone, don't create story

## Migrate a component from apps/frontend

Migrate from `apps/frontend` → `packages/vue/src/components`.

**Prereq:** Identify target | Analyze current usage (context, props, interactions)

**Block:** Components using `@utils/api`, `client.ts`, API imports

**Keep:** `useI18n()` / `t()` translations | **Remove:** Direct store access (pass as props)

**Steps:** Follow "New Vue Component" above + the git commit practices in AGENTS.md | Clean refactor with TSDoc | Semantic HTML + ARIA | Keyboard nav | Migrate related components/utils/interfaces/types | For multiple components, apply migration iteratively

**Completion:** Update `apps/frontend` imports to `@beabee/vue` | Create wrappers for repeated prop combos | Reuse existing import declarations | Remove translation prop drilling | Run `yarn generate:index && yarn format && yarn build && yarn check` | Verify stories exist | Suggest pages/routes to test | Provide commit msg + PR description
