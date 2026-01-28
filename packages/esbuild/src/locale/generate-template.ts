/** Build template from en.json: same structure, all strings empty, keys alphabetical. */
import { join } from 'node:path';

import type { LocaleObject } from '../types/index.ts';
import {
  mapLocaleStrings,
  readJsonFile,
  sortKeysAlphabetically,
  throwWithContext,
  writeJsonFile,
} from './utils.ts';

const EN = 'en.json';

export async function generateTemplate(
  localesDir: string,
  templatePath: string
): Promise<void> {
  try {
    const en = await readJsonFile<LocaleObject>(join(localesDir, EN));
    await writeJsonFile(
      templatePath,
      sortKeysAlphabetically(mapLocaleStrings(en, () => ''))
    );
  } catch (err) {
    throwWithContext(err, 'generating template');
  }
}
