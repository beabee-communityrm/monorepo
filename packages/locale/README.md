# Beabee Locale Package

This package contains translations for the Beabee project. It provides locale data in JSON format and exports TypeScript sources directly for ESM environments, while building CJS modules for legacy CommonJS compatibility.

## Package Structure

The locale package is structured as follows:

- `src/locales/`: Contains JSON files for each supported language
- `src/config.ts`: Contains configuration for each locale

## Supported languages

We support three levels of translation, each defining how many strings must be translated. This tiered approach helps us introduce new languages more efficiently based on the most common use cases.

### CNR-only

The smallest translation set. These languages are only available on public-facing CrowdNewsroom pages and should be used exclusively in CNR mode.

- Russian (ru)
- Germany (de@easy)
- Greek (el)

Example `config.ts` configuration:
```ts
  "de@easy": {
    baseLocale: "de",
    name: "Deutsch (einfach)",
    displayName: "Leichte Sprache",
    adminLocale: "de", // Fallback to German for admin panels
    fallbackLocale: "de@informal",
    availableIn: [LocaleContext.Callout], // Only available in CrowdNewsrooms (callouts)
  },
```

Weblate:
- Tags: CNR, System
- [Missing translations](https://hosted.weblate.org/search/beabee/platform/?q=state%3Aempty+AND+%28language%3Aru+OR+language%3Ade%40easy+OR+language%3Ael%29+AND+%28label%3Acnr+OR+label%3Asystem%29&sort_by=-priority%2Cposition&checksum=)

### User facing

These languages are available across the platform for all users, but admin-only strings are not translated. Admins will see the dashboard in English. This is a practical compromise that allows broader language support while keeping admin functionality accessible.

- Portugeuse (pt)
- Italian (it)

Example `config.ts` configuration:

```ts
  pt: {
    baseLocale: "pt",
    name: "Português",
    displayName: "Português",
    adminLocale: "en", // Fallback to English for admin panels
    availableIn: [LocaleContext.Callout, LocaleContext.System], // Available everywhere
  },
```

Weblate:
- Tags: CNR, System, User
- [Missing translations](https://hosted.weblate.org/search/beabee/platform/?q=state%3Aempty+AND+%28language%3Apt+OR+language%3Ait%29+AND+NOT+label%3Aadmin&sort_by=-priority%2Cposition&checksum=)

### Fully translated

These languages are available throughout the entire platform, including admin dashboards. All strings are fully translated.

- English (en)
- German (de, de@informal)
- French (fr)
- Dutch (nl)

Example `config.ts` configuration:
```ts
  "de": {
    baseLocale: "de",
    name: "Deutsch",
    displayName: "Deutsch",
    adminLocale: "de", // Use on the admin panels too
    fallbackLocale: "de",
    availableIn: [LocaleContext.Callout, LocaleContext.System], // Available everywhere
  },
```


Weblate:
- Tags: CNR, System, User, Admin
- [Missing translations](https://hosted.weblate.org/search/beabee/platform/?page=1&limit=100&q=state%3Aempty+AND+%28language%3Ade+OR+language%3Ade%40informal+OR+language%3Aen+OR+language%3Afr+OR+language%3Anl%29&sort_by=-priority%2Cposition)

## Usage

The package supports dual import formats:

1. **ESM (TypeScript sources)** - Direct TypeScript import for modern environments
2. **CJS (Built JavaScript)** - For legacy CommonJS environments

```typescript
// ESM imports (uses TypeScript sources directly)
import { config, isLocale, type Locale } from '@beabee/locale';

// Import specific locale data 
import en from '@beabee/locale/locales/en';
import de from '@beabee/locale/locales/de';

// Check if a string is a valid locale
const userLocale = 'de@informal';
if (isLocale(userLocale)) {
  // It's a valid locale
  console.log(config[userLocale].name); // "Deutsch (informal)"
}
```

**ESM TypeScript imports** work with bundlers that support TypeScript (Vite, esbuild, etc.) or Node.js with TypeScript support:
```bash
# With Node.js TypeScript support
node --experimental-specifier-resolution=node --experimental-strip-types --experimental-transform-types --no-warnings your-file.ts

# With bundlers like Vite or esbuild - no special flags needed
```

**CJS imports** work with standard Node.js:
```javascript
const { config, isLocale } = require('@beabee/locale');
```

## Development

### Building

```bash
# Clear previous builds
yarn clear

# Build the package
yarn build

# Type check without emitting files
yarn check
```

## Translation Guidelines

Beabee is a community resource management system, and we welcome contributions to our translations. This section provides guidelines for translators working with the Beabee locale files.

### About Beabee Translations

Beabee supports multiple languages to make the platform accessible to users worldwide. Our translation system stores strings in JSON format, which are then used throughout the application to provide a localized experience.

We welcome translations in both directions:
1. **Via Weblate**: Our recommended approach for non-developers, as it provides a user-friendly interface for translation.
2. **Direct JSON Editing**: Preferred for developers who want to contribute translations directly in the codebase.

### Getting Started with Translations

<a href="https://hosted.weblate.org/engage/beabee/">
<img src="https://hosted.weblate.org/widget/beabee/platform/open-graph.png" alt="translation status" />
</a>

#### Using Weblate

[Weblate](https://weblate.org/) provides a user-friendly interface for translating strings without needing to understand the technical details.

For detailed instructions on how to use Weblate, check the [official Weblate documentation](https://docs.weblate.org/en/latest/user/translating.html). The documentation is available in many languages - you can change the language using the language selector.

1. **Browse to Translation Projects**: Select the Beabee project and choose the component you want to translate.
2. **Choose Your Language**: Select the language you want to translate to.
3. **Start Translating**: You'll see a list of strings that need translation. Click on each string to provide a translation.
4. **Submit Translations**: Once you've translated strings, submit them for review.

Tips for using Weblate:
- Use the "Suggestions" feature if you're unsure about a translation.
- Add comments if you have questions or need clarification about a string.
- Use the "Translation Memory" to maintain consistency across similar phrases.
- Check the "Glossary" for project-specific terminology.

#### Direct JSON Editing

For developers who prefer working directly with the code:

1. Find the appropriate JSON file in `src/locales/` (e.g., `de.json` for German).
2. Add or modify translations while maintaining the existing structure.
3. Submit a pull request with your changes.

### Translation Guidelines

1. **Maintain Context**: Understand the context where the string is used before translating.
2. **Keep Formatting**: Preserve HTML tags, variables (like `{name}`), and special characters.
3. **Be Consistent**: Use consistent terminology throughout the translation.
4. **Consider Space Constraints**: Some UI elements have limited space; keep translations concise.
5. **Respect Cultural Differences**: Adapt translations to be culturally appropriate.

### Special Formats

- **Markdown Support**: Some strings support markdown formatting (emphasis, links).
- **Variables**: Text containing `{variableName}` has dynamic content that will be replaced at runtime.
- **Pluralization**: Some strings have different forms based on count (singular/plural).

### Testing Your Translations

To see your translations in action:
1. Build the package (`yarn build`)
2. Rebuild and start the Beabee application
3. Switch to your language

## Contributor Agreement

By contributing translations to the Beabee project, you agree that:

1. Your contributions are submitted under the Creative Commons Attribution 4.0 International License.
2. You have the right to submit your translations under this license.
3. You understand that your translations will be publicly available and can be used, shared, and adapted by others according to the terms of the license.
4. Beabee may use your translations as part of the application and related documentation.
5. Your name or username may be credited as a contributor to the translations.

This agreement helps ensure that all translations can be legally included in the Beabee project and redistributed to users.

## License

All translations are licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/)
