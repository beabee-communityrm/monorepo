# ContactSelector

Compact contact selector with prev/next buttons and fixed-width display of the current contact. Application-independent; all user-visible strings are passed as props so the component can be used in any context (email preview, assign contact, etc.) with the appropriate translations from the app.

Use `countTemplate` with placeholders `%current%` and `%total%` for the position text (e.g. "Contact %current% of %total%"). The component replaces these so that Vue I18n does not interpolate them when the parent passes `t('contactSelector.contactNOfTotal')`.
