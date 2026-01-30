# AppLoadingSpinner

Inline loading indicator (spinner + optional message). Use where a small loading state is needed (e.g. preview panels, inline content). Matches design tokens used in AppStatusPage.

- **Visibility**: Control via `v-if` on the instance (e.g. `<AppLoadingSpinner v-if="loading" />`).
- **Message**: Optional text next to the spinner (e.g. "Loading...").
- **Inverted**: Use on dark backgrounds (e.g. image upload overlay); spinner and message use light color.
