import { join } from 'node:path';
import { readJsonFile, mergeObjects } from './utils.ts';
import type { LocaleOption } from '@beabee/locale';

/**
 * Recursively applies fallback translations to a locale
 * @param translations The current translations object
 * @param fallbackTranslations The fallback translations object
 * @returns The merged translations object
 */
function applyFallbackTranslationsToObject(
  translations: Record<string, any>,
  fallbackTranslations: Record<string, any>
): Record<string, any> {
  return mergeObjects(translations, fallbackTranslations, (target, source) => {
    // If target is empty string or undefined, use the fallback translation
    return !target ? source : target;
  });
}

/**
 * Applies fallback translations to a specific locale file
 * @param localeId The locale ID (e.g., "de@easy")
 * @param config The locale configuration
 * @param localesDir The directory containing the locale files
 * @returns The processed translations with fallbacks applied
 */
async function processFallbacksForLocale(
  localeId: string,
  config: Record<string, LocaleOption>,
  localesDir: string
): Promise<Record<string, any>> {
  const localeConfig = config[localeId];
  if (!localeConfig) {
    throw new Error(`No configuration found for locale: ${localeId}`);
  }

  // Read the current locale's translations
  const localeFile = join(localesDir, `${localeId}.json`);
  const translations = await readJsonFile<Record<string, any>>(localeFile);

  // If there's no fallback, return the current translations
  if (!localeConfig.fallbackLocale) {
    return translations;
  }

  // Process fallbacks recursively
  const fallbackTranslations = await processFallbacksForLocale(
    localeConfig.fallbackLocale,
    config,
    localesDir
  );

  // Apply fallback translations
  const result = applyFallbackTranslationsToObject(
    translations,
    fallbackTranslations
  );

  return result;
}

/**
 * Applies fallback translations to all locale files in a directory
 * @param configPath Path to the config.json file
 * @param localesDir Directory containing the locale files
 */
export async function applyFallbackTranslations(
  configPath: string,
  localesDir: string
): Promise<Record<string, Record<string, any>>> {
  // Read the config file
  const config = await readJsonFile<Record<string, LocaleOption>>(configPath);
  const processedTranslations: Record<string, Record<string, any>> = {};

  // Process each locale
  for (const [localeId, localeConfig] of Object.entries(config)) {
    // Skip locales that don't have a fallback locale
    if (
      !localeConfig.fallbackLocale ||
      localeId === localeConfig.fallbackLocale
    )
      continue;

    processedTranslations[localeId] = await processFallbacksForLocale(
      localeId,
      config,
      localesDir
    );
  }

  return processedTranslations;
}
