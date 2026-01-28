/**
 * Normalize locale JSON: same keys as en.json, missing keys filled with empty string,
 * key order alphabetical (like template.json).
 */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { LocaleObject } from '../types/index.ts';
import {
  mergeLocaleObjects,
  readJsonFile,
  sortKeysAlphabetically,
  throwWithContext,
  writeJsonFile,
} from './utils.ts';

const SOURCE_LOCALE = 'en.json';

export async function normalizeTranslations(localesDir: string): Promise<void> {
  try {
    const enPath = join(localesDir, SOURCE_LOCALE);
    const en = await readJsonFile<LocaleObject>(enPath);

    const files = await readdir(localesDir);
    const localeFiles = files.filter(
      (f) => f.endsWith('.json') && f !== SOURCE_LOCALE
    );

    for (const file of localeFiles) {
      const path = join(localesDir, file);
      const data = await readJsonFile<LocaleObject>(path);
      const merged = mergeLocaleObjects(data, en, (target) => target ?? '');
      const sorted = sortKeysAlphabetically(merged);
      await writeJsonFile(path, sorted);
    }
  } catch (err) {
    throwWithContext(err, 'normalizing locale files');
  }
}
