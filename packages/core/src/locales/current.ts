import * as locales from '@beabee/locale/locales';

import OptionsService from '#services/OptionsService';

/**
 * TODO: Duplicate of the function in locale/generate.ts
 * Converts a locale string to a valid camelCase variable name
 * @param name - The locale string (e.g. "de@easy", "en-US")
 * @returns The camelCase variable name (e.g. "deEasy", "enUs")
 */
function toCamelCase(name: string): keyof typeof locales {
  // Get the last part of the path (e.g. "de@easy" from "locales/de@easy")
  const localeName = name.split('/').pop() || '';

  // Split by separators (@ or -) and capitalize each part except the first
  return localeName
    .split(/[@-]/)
    .map((part, index) =>
      index === 0
        ? part.toLowerCase()
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join('') as keyof typeof locales;
}

export default function currentLocale() {
  return locales[toCamelCase(OptionsService.getText('locale'))];
}
