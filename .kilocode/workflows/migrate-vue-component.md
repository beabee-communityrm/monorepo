# Migrate Vue Component Workflow

Migrate Vue components from `apps/frontend` to `packages/vue/src/components`.

## Prerequisites
1. Identify target component (ask if not specified)
2. Analyze the current usage of the target component(s) within `apps/frontend` using `search_files` and `read_file` to understand its context, prop usage, and interaction patterns
3. Use this information to inform refactoring, story creation, or integration updates

## Migration Rules
- **Block API components**: Do not migrate components using `@utils/api`, `client.ts`, or API imports
- **Keep i18n dependencies**: Maintain `useI18n()` and `t()` for translations (do not replace with props)
- **Remove store dependencies**: Pass store data as props instead of direct store access
- **Include dependencies**: Migrate related components, utils, interfaces, types

## Implementation Steps
1. Follow the patterns from `/new-vue-component.md` workflow
2. Follow git commit best practices from `.kilocode/rules/git-commit-best-practices.md`
3. Perform clean refactoring with TSDoc documentation
4. Maintain required functionality
5. Add semantic HTML and ARIA attributes
6. Implement keyboard navigation support
7. When migrating multiple components, apply the migration process iteratively

## Completion Steps
1. Update `apps/frontend`:
   - Update imports to use `@beabee/vue` instead of local paths
   - Create wrapper components that appear multiple times with many identical property combinations
   - Reuse existing import declarations: `import { AlreadyExistingComponent, MigratedComponent } from '@beabee/vue';`
   - Remove any translation prop drilling since components now handle i18n internally
   - Repeat all necessary steps for each component involved

2. Run validation using `execute_command`:
   ```bash
   yarn generate:index && yarn format && yarn build && yarn check
   ```

3. Review all migrated components and verify that stories exist for each component where appropriate, check if they are logically grouped, and iterate to create missing stories or improve organization if needed

4. Suggest specific frontend pages and routes that should be visited to test the migrated Vue components

5. Use `ask_followup_question` to get approval for commit message and PR description
