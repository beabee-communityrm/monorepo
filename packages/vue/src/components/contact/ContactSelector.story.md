# ContactSelector

Compact contact selector with prev/next buttons and fixed-width display of the current contact. No built-in label; the parent renders any label above the control. All user-visible strings are passed as props so the component can be used in any context (email preview, assign contact, etc.) with the appropriate translations from the app.

Use `countTemplate` with placeholders `%current%` and `%total%` for the position text (e.g. "Contact %current% of %total%"). Pass the same label text as `nameAriaLabel` for accessibility.
