import type { LocaleOption } from '@beabee/locale';

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { LocaleObject } from '../types/index.ts';
import {
  mergeLocaleObjects,
  readJsonFile,
  sortKeysAlphabetically,
  writeJsonFile,
} from './utils.ts';

function mergeWithFallback(
  locale: LocaleObject,
  fallback: LocaleObject
): LocaleObject {
  return mergeLocaleObjects(locale, fallback, (t, s) => t || s);
}

async function loadLocaleWithFallbacks(
  localeId: string,
  config: Record<string, LocaleOption>,
  localesDir: string
): Promise<LocaleObject> {
  const cfg = config[localeId];
  if (!cfg) throw new Error(`No config for locale: ${localeId}`);

  const path = join(localesDir, `${localeId}.json`);
  const data = await readJsonFile<LocaleObject>(path);

  if (!cfg.fallbackLocale) return data;

  const fallback = await loadLocaleWithFallbacks(
    cfg.fallbackLocale,
    config,
    localesDir
  );
  return mergeWithFallback(data, fallback);
}

/** Writes locale files with fallbacks applied to outputDir. Keys sorted alphabetically. */
export async function generateFallbackTranslations(
  config: Record<string, LocaleOption>,
  localesDir: string,
  outputDir: string
): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  for (const [localeId, cfg] of Object.entries(config)) {
    const data =
      cfg.fallbackLocale && localeId !== cfg.fallbackLocale
        ? await loadLocaleWithFallbacks(localeId, config, localesDir)
        : await readJsonFile<LocaleObject>(
            join(localesDir, `${localeId}.json`)
          );
    await writeJsonFile(
      join(outputDir, `${localeId}.json`),
      sortKeysAlphabetically(data)
    );
  }
}
