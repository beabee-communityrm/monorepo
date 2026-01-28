/**
 * Build template from en.json: same structure, all string values empty.
 * Key order alphabetical.
 */
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
    const enPath = join(localesDir, SOURCE_LOCALE);
    const en = await readJsonFile<LocaleObject>(enPath);
    const template = mapLocaleStrings(en, () => '');
    const sorted = sortKeysAlphabetically(template);
    await writeJsonFile(templatePath, sorted);
  } catch (err) {
    throwWithContext(err, 'generating template');
  }
}
