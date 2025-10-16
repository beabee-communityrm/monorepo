# New Vue Component Workflow

Create Vue components with stories and documentation. Follow existing patterns and templates.

## Templates and References
1. Use `read_file` to examine these templates:
   - Component: `packages/vue/src/components/template/AppTemplate.vue`
   - Story: `packages/vue/src/components/template/AppTemplate.story.vue`
   - Documentation: `packages/vue/src/components/template/AppTemplate.story.md`
   - Exports: `packages/vue/src/components/template/index.ts`

2. Review rules and standards:
   - Code Standards: `.kilocode/rules/frontend-code-structure.md`
   - Documentation: `.kilocode/rules/vue-component-story-documentation.md`
   - Additional component types: `packages/vue/src/types`

## Prerequisites
1. Identify component requirements using `ask_followup_question` if not specified:
   - Component name and purpose
   - Props and events needed
   - Styling requirements

2. Use `list_code_definition_names` to analyze existing folder structure in `packages/vue/src/components`

## Requirements
- Application-independent (no API dependencies)
- Must create `.story.vue` and `.story.md` files
- Reference existing documentation instead of duplicating
- Follow patterns from existing components

## Implementation Steps

1. Determine component location:
   - Analyze the existing folder structure in `packages/vue/src/components`
   - Assign component to a semantically appropriate directory
   - If no suitable directory exists, create a new folder that reflects the component's purpose and scope
   - Prioritize maintainability and logical grouping

2. Create the component using `write_to_file`:
   - Component file: `packages/vue/src/components/[category]/[ComponentName].vue`
   - Story file: `packages/vue/src/components/[category]/[ComponentName].story.vue`
   - Documentation: `packages/vue/src/components/[category]/[ComponentName].story.md`
   - Exports: Update or create `packages/vue/src/components/[category]/index.ts`

3. Follow coding standards:
   - Mobile-first design approach
   - Tailwind CSS styling with responsive design
   - Semantic HTML elements and ARIA attributes
   - Comprehensive prop interfaces with JSDoc
   - `defineEmits<>()` syntax for events
   - Touch-friendly targets (44x44px minimum)

4. Run validation using `execute_command`:
   ```bash
   yarn generate:index && yarn format && yarn build && yarn check
   ```

5. Use `ask_followup_question` to get approval for commit message
