import type { LocaleOption } from '@beabee/locale';

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { mergeObjects, readJsonFile, writeJsonFile } from './utils.ts';

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
 * Applies fallback translations to all locale files in a directory using config object
 * @param config The locale configuration object
 * @param localesDir Directory containing the locale files
 * @returns The processed translations with fallbacks applied
 * @private Internal function used by applyFallbacksToSources
 */
async function applyFallbackTranslations(
  config: Record<string, LocaleOption>,
  localesDir: string
): Promise<Record<string, Record<string, any>>> {
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

/**
 * Generates fallback translations and writes them to an output directory
 * This ensures that direct TypeScript imports get the fallbacks applied without modifying source files
 * @param config The locale configuration object
 * @param localesDir Directory containing the source locale files
 * @param outputDir Directory where processed locale files with fallbacks will be written
 */
export async function generateFallbackTranslations(
  config: Record<string, LocaleOption>,
  localesDir: string,
  outputDir: string
): Promise<void> {
  console.log('📋 Applying fallback translations to output directory...');

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  // Get processed translations with fallbacks applied
  const processedTranslations = await applyFallbackTranslations(
    config,
    localesDir
  );

  // Write the processed translations to the output directory
  for (const [localeId, translations] of Object.entries(
    processedTranslations
  )) {
    const outputFile = join(outputDir, `${localeId}.json`);
    await writeJsonFile(outputFile, translations);
    console.log(`✅ Applied fallbacks to ${localeId}.json in output directory`);
  }

  // Also copy locales without fallbacks to the output directory
  for (const [localeId, localeConfig] of Object.entries(config)) {
    if (
      !localeConfig.fallbackLocale ||
      localeId === localeConfig.fallbackLocale
    ) {
      const sourceFile = join(localesDir, `${localeId}.json`);
      const outputFile = join(outputDir, `${localeId}.json`);

      // Read source file and write to output directory
      const translations = await readJsonFile<Record<string, any>>(sourceFile);
      await writeJsonFile(outputFile, translations);
      console.log(`✅ Copied ${localeId}.json to output directory`);
    }
  }

  console.log(
    `🎉 Fallback translations applied to output directory: ${outputDir}`
  );
}
