// Post-tsc step: copy JSON locales into dist/, generate fallback translations,
// normalize translation files, and refresh the template.
import {
  copyFile,
  mkdir,
  readFile,
  readdir,
  writeFile,
} from 'node:fs/promises';
import { join } from 'node:path';

import { config } from '../dist/config.js';

const SOURCE_LOCALES_DIR = './src/locales';
const TEMPLATE_PATH = './src/template.json';
const DIST_LOCALES_DIR = './dist/locales';
const FALLBACK_DIR = './dist/locales-with-fallback';
const SOURCE_LOCALE = 'en.json';

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf-8'));
}

async function writeJson(path, data) {
  await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function sortKeys(obj) {
  const result = {};
  for (const key of Object.keys(obj).sort()) {
    const v = obj[key];
    result[key] = typeof v === 'object' && v !== null ? sortKeys(v) : (v ?? '');
  }
  return result;
}

function mapStrings(obj, fn) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] =
      typeof value === 'object' && value !== null
        ? mapStrings(value, fn)
        : fn(value ?? '');
  }
  return out;
}

function mergeShape(target, source, pickString) {
  const result = { ...target };
  for (const [key, sourceVal] of Object.entries(source)) {
    const targetVal = result[key];
    const sourceObj = typeof sourceVal === 'object' && sourceVal !== null;
    const targetObj = typeof targetVal === 'object' && targetVal !== null;
    if (!(key in result)) {
      result[key] = sourceObj
        ? mergeShape({}, sourceVal, pickString)
        : pickString(undefined, sourceVal);
    } else if (sourceObj && targetObj) {
      result[key] = mergeShape(targetVal, sourceVal, pickString);
    } else if (typeof sourceVal === 'string' && typeof targetVal === 'string') {
      result[key] = pickString(targetVal, sourceVal);
    }
  }
  return result;
}

async function copyLocaleJsonToDist() {
  await mkdir(DIST_LOCALES_DIR, { recursive: true });
  const files = (await readdir(SOURCE_LOCALES_DIR)).filter((f) =>
    f.endsWith('.json')
  );
  for (const f of files) {
    await copyFile(join(SOURCE_LOCALES_DIR, f), join(DIST_LOCALES_DIR, f));
  }
  console.log(`📋 copied ${files.length} locale files to ${DIST_LOCALES_DIR}`);
}

async function normalizeTranslations() {
  const en = await readJson(join(SOURCE_LOCALES_DIR, SOURCE_LOCALE));
  const files = (await readdir(SOURCE_LOCALES_DIR)).filter((f) =>
    f.endsWith('.json')
  );
  for (const file of files) {
    const path = join(SOURCE_LOCALES_DIR, file);
    const data = await readJson(path);
    await writeJson(path, sortKeys(mergeShape(data, en, (t) => t ?? '')));
  }
}

async function generateTemplate() {
  const en = await readJson(join(SOURCE_LOCALES_DIR, SOURCE_LOCALE));
  await writeJson(TEMPLATE_PATH, sortKeys(mapStrings(en, () => '')));
}

async function loadWithFallbacks(localeId, seen = new Set()) {
  if (seen.has(localeId)) {
    throw new Error(`Fallback cycle through ${localeId}`);
  }
  seen.add(localeId);
  const cfg = config[localeId];
  if (!cfg) throw new Error(`No config for locale: ${localeId}`);
  const data = await readJson(join(SOURCE_LOCALES_DIR, `${localeId}.json`));
  if (!cfg.fallbackLocale || cfg.fallbackLocale === localeId) return data;
  const fb = await loadWithFallbacks(cfg.fallbackLocale, seen);
  return mergeShape(data, fb, (t, s) => t || s);
}

async function generateFallbacks() {
  await mkdir(FALLBACK_DIR, { recursive: true });
  for (const [localeId, cfg] of Object.entries(config)) {
    const data =
      cfg.fallbackLocale && localeId !== cfg.fallbackLocale
        ? await loadWithFallbacks(localeId)
        : await readJson(join(SOURCE_LOCALES_DIR, `${localeId}.json`));
    await writeJson(join(FALLBACK_DIR, `${localeId}.json`), sortKeys(data));
  }
  console.log(
    `📋 generated fallback translations for ${Object.keys(config).length} locales`
  );
}

await normalizeTranslations();
await generateTemplate();
await copyLocaleJsonToDist();
await generateFallbacks();
console.log('@beabee/locale build completed');
