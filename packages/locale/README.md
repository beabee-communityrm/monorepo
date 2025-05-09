# Beabee Locale Package

This package contains translations for the Beabee project. It provides locale data in JSON format and builds it into ESM and CJS modules for use in both browser and Node.js environments.

## Package Structure

The locale package is structured as follows:

- `src/locales/`: Contains JSON files for each supported language
- `src/config.json`: Contains configuration for each locale

Currently supported languages:
- English (en)
- German (de, de@informal, de@easy)
- Dutch (nl)
- Portuguese (pt)
- Italian (it)
- Russian (ru)

## Usage

Import the locale data in your project:

```typescript
// Import config and helper functions
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

[Weblate](https://weblate.org/) provides a user-friendly interface for translating strings without needing to understand the technical details:

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

## License

All translations are licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/)
