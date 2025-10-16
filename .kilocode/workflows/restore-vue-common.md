# Restore Vue Design System Independence Workflow

Move components with external dependencies from `packages/vue` to `apps/frontend` for clear separation.

## Migration Targets

**Move to Frontend (Business Logic Dependencies):**
- Components importing from `@beabee/beabee-common`, `@beabee/client`
- API client usage, backend schemas/workflows

**Keep in Vue (Design System):**
- Basic UI components (buttons, inputs, modals)
- Layout/typography components
- Generic utilities without business logic
- Components without beabee client, common, or backend dependencies

## Workflow Steps

### Phase 1: Component Migration

**CRITICAL**: Always use `git mv` for clean history tracking.

1. Move component directory using `execute_command`:
   ```bash
   git mv packages/vue/src/components/[component] apps/frontend/src/components/
   ```

2. Use `ask_followup_question` to get approval for commit:
   ```bash
   git commit -m "refactor(vue): Move [component] components to frontend"
   ```

### Phase 2: Cleanup and Import Fixes

3. Remove story files and index using `execute_command`:
   ```bash
   rm apps/frontend/src/components/[component]/*.story.* apps/frontend/src/components/[component]/index.ts
   ```

4. Migrate related types using `execute_command`:
   ```bash
   git mv packages/vue/src/types/[component].ts apps/frontend/src/type/
   ```

5. Fix imports in migrated components using `apply_diff`:
   - Change `'../form'` → `'@beabee/vue'`
   - Change `'../button'` → `'@beabee/vue'`
   - Change `'../../types/[component]'` → `'@/type/[component]'`

6. Remove exports using `apply_diff`:
   - Delete from `packages/vue/src/components/index.ts`
   - Update `packages/vue/src/types/index.ts`

7. Update frontend usage using `search_files` and `apply_diff`:
   - Change `import { Component } from '@beabee/vue'` → `import Component from '@components/[dir]/Component.vue'`

### Phase 3: Validation ⚠️ CRITICAL

8. Format and validate continuously using `execute_command`:
   ```bash
   yarn format && yarn check
   ```

9. Final validation before commit using `execute_command`:
   ```bash
   cd packages/vue && yarn format && yarn check
   cd ../../apps/frontend && yarn format && yarn check
   cd ../.. && yarn check
   ```

10. Use `ask_followup_question` to get approval for commit:
    ```bash
    git add -A && git commit -m "refactor(frontend): Update [component] imports and cleanup after migration"
    ```

## Validation Rules ⚠️ MANDATORY

- **NEVER commit code that fails `yarn format` or `yarn check`**
- **Run validation after each phase, not just at the end**
- **If TypeScript errors persist after 3 attempts, document them and seek guidance**
- **Vue package MUST always compile cleanly after migration**

## Success Criteria
- Clean git history with explicit moves
- Both packages build and pass linting
- Vue package contains only design system components
- All imports resolve correctly
