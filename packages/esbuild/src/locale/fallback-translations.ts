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

/** Merge locale with fallback: use target value when non-empty, else source. */
function mergeWithFallback(
  locale: LocaleObject,
  fallback: LocaleObject
): LocaleObject {
  return mergeLocaleObjects(locale, fallback, (target, source) =>
    target ? target : source
  );
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

/**
 * Writes locale files with fallbacks applied to outputDir.
 * Key order alphabetical.
 */
export async function generateFallbackTranslations(
  config: Record<string, LocaleOption>,
  localesDir: string,
  outputDir: string
): Promise<void> {
  await mkdir(outputDir, { recursive: true });

  const withFallback = Object.entries(config).filter(
    ([id, cfg]) => cfg.fallbackLocale && id !== cfg.fallbackLocale
  );

  for (const [localeId] of withFallback) {
    const data = await loadLocaleWithFallbacks(localeId, config, localesDir);
    await writeJsonFile(
      join(outputDir, `${localeId}.json`),
      sortKeysAlphabetically(data)
    );
  }

  const withoutFallback = Object.entries(config).filter(
    ([id, cfg]) => !cfg.fallbackLocale || id === cfg.fallbackLocale
  );

  for (const [localeId] of withoutFallback) {
    const data = await readJsonFile<LocaleObject>(
      join(localesDir, `${localeId}.json`)
    );
    await writeJsonFile(
      join(outputDir, `${localeId}.json`),
      sortKeysAlphabetically(data)
    );
  }
}
