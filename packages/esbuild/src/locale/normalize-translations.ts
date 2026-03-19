/** Normalize locale JSON: same keys as en.json, missing → "", keys alphabetical. */
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
    const en = await readJsonFile<LocaleObject>(
      join(localesDir, SOURCE_LOCALE)
    );
    const files = (await readdir(localesDir)).filter((f) =>
      f.endsWith('.json')
    );
    for (const file of files) {
      const path = join(localesDir, file);
      const data = await readJsonFile<LocaleObject>(path);
      await writeJsonFile(
        path,
        sortKeysAlphabetically(mergeLocaleObjects(data, en, (t) => t ?? ''))
      );
    }
  } catch (err) {
    throwWithContext(err, 'normalizing locale files');
  }
}
