/** Build template from source locale en.json: same structure, all strings empty, keys alphabetical. */
import { join } from 'node:path';

import type { LocaleObject } from '../types/index.ts';
import {
  mapLocaleStrings,
  readJsonFile,
  sortKeysAlphabetically,
  throwWithContext,
  writeJsonFile,
} from './utils.ts';

const SOURCE_LOCALE = 'en.json';

export async function generateTemplate(
  localesDir: string,
  templatePath: string
): Promise<void> {
  try {
    const sourceLocale = await readJsonFile<LocaleObject>(
      join(localesDir, SOURCE_LOCALE)
    );
    await writeJsonFile(
      templatePath,
      sortKeysAlphabetically(mapLocaleStrings(sourceLocale, () => ''))
    );
  } catch (err) {
    throwWithContext(err, 'generating template');
  }
}
