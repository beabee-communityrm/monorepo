import { readFile, writeFile } from 'node:fs/promises';

import type { LocaleObject } from '../types/index.ts';

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/** Writes JSON with 2-space indent and trailing newline. */
export async function writeJsonFile(
  filePath: string,
  data: LocaleObject
): Promise<void> {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Returns a copy of `obj` with keys at each level sorted alphabetically.
 */
export function sortKeysAlphabetically(obj: LocaleObject): LocaleObject {
  const result: LocaleObject = {};
  for (const key of Object.keys(obj).sort()) {
    const v = obj[key];
    if (typeof v === 'object') {
      result[key] = sortKeysAlphabetically(v);
    } else {
      result[key] = v ?? '';
    }
  }
  return result;
}

/** Recursively maps string values; nested objects are traversed. Key order follows input. */
export function mapLocaleStrings(
  obj: LocaleObject,
  fn: (value: string) => string
): LocaleObject {
  const out: LocaleObject = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object') {
      out[key] = mapLocaleStrings(value, fn);
    } else {
      out[key] = fn(value ?? '');
    }
  }
  return out;
}

/**
 * Merges target into source shape: for each key in source, result has that key.
 * Values: from target when present (and same type), else from source. Nested objects merged recursively.
 * stringHandler(targetValue, sourceValue) decides the final string when both are strings.
 */
export function mergeLocaleObjects(
  target: LocaleObject,
  source: LocaleObject,
  stringHandler: (targetVal: string | undefined, sourceVal: string) => string
): LocaleObject {
  const result: LocaleObject = { ...target };

  for (const [key, sourceVal] of Object.entries(source)) {
    const targetVal = result[key];
    const isSourceObject = typeof sourceVal === 'object';
    const isTargetObject = typeof targetVal === 'object';

    if (!(key in result)) {
      result[key] = isSourceObject
        ? mergeLocaleObjects({}, sourceVal, stringHandler)
        : stringHandler(undefined, sourceVal);
    } else if (isSourceObject && isTargetObject) {
      result[key] = mergeLocaleObjects(targetVal, sourceVal, stringHandler);
    } else if (typeof sourceVal === 'string' && typeof targetVal === 'string') {
      result[key] = stringHandler(targetVal, sourceVal);
    }
  }

  return result;
}

export function throwWithContext(error: unknown, context: string): never {
  console.error(`Error ${context}:`, error);
  throw error;
}
