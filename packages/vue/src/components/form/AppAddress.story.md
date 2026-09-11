# AppAddress

The `AppAddress` component provides a structured address input form with standardized fields for capturing postal addresses.

## Usage

This component is designed for collecting postal addresses in forms and uses internal i18n for field labels. It provides separate v-model bindings for each address field, allowing fine-grained control over the address data structure.

The component automatically applies appropriate validation requirements when the `required` prop is set to `true`.

The country field binds an ISO 3166-1 alpha-2 code. Country names are not translated in `@beabee/locale`, they are resolved from the active locale via `Intl.DisplayNames` and sorted accordingly, so the option order differs between locales.
