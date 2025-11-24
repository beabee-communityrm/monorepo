# Vue Component Story Workflow

Create a story for a Vue component.

## Prerequisites

1. Identify the target component using `ask_followup_question` if not specified
2. Use `search_files` and `read_file` to analyze the component and its current usage within `apps/frontend`
3. Understand its context, prop usage, and interaction patterns

## References

1. Use `read_file` to examine the template:
   - `packages/vue/src/components/template/AppTemplate.story.vue`
   - `packages/vue/src/components/template/AppTemplate.story.md`

2. Review documentation guidelines:
   - `.kilocode/rules/vue-component-story-documentation.md`

3. Check Tailwind configuration:
   - `packages/vue/tailwind.config.js` to know all available Tailwind utility classes and variants

## Implementation Steps

1. Analyze component requirements:
   - Review component props and events
   - Identify different use cases and variations
   - Consider accessibility requirements

2. Create story file using `write_to_file`:
   - File: `packages/vue/src/components/[category]/[ComponentName].story.vue`
   - Include multiple story variations demonstrating different prop combinations
   - Show responsive behavior and different states
   - Include interactive examples where appropriate

3. Create documentation using `write_to_file`:
   - File: `packages/vue/src/components/[category]/[ComponentName].story.md`
   - Document only what's necessary beyond source code
   - Focus on usage, purpose, and implementation notes
   - Don't duplicate props, events, or examples already in code

4. Follow best practices:
   - Use context information from usage analysis for story creation
   - If a UI component cannot be meaningfully used on its own, do not create a Storybook story for it
   - Ensure stories are accessible and demonstrate accessibility features

5. Run validation using `execute_command`:
   ```bash
   yarn format && yarn build && yarn check
   ```

6. Use `ask_followup_question` to get approval for commit message
