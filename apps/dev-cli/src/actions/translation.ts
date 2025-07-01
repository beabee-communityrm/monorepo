import { type Locale, config as localeConfig } from '@beabee/locale/src';

import { readFile, writeFile } from 'node:fs/promises';
import Module from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  ListTranslationKeysOptions,
  ListTranslationKeysResult,
  SetTranslationOptions,
  SetTranslationResult,
  TranslationKeyInfo,
  TranslationValidationResult,
} from '../types/translation.ts';

const require = Module.createRequire(import.meta.url);
const locales = require('@beabee/locale/src/locales') as Record<
  Locale,
  Record<string, string>
>;

// Get the locale package path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCALE_PACKAGE_PATH = resolve(
  __dirname,
  '../../../../packages/locale/src/locales'
);

/**
 * Get all available locales from the locale config
 */
export function getAvailableLocales(): Locale[] {
  return Object.keys(localeConfig) as Locale[];
}

/**
 * Get the correct locale file name from locale code
 */
function getLocaleFileName(locale: Locale): string {
  return `${locale.replace('@', '@')}.json`;
}

/**
 * Get locale file path
 */
function getLocaleFilePath(locale: Locale): string {
  return resolve(LOCALE_PACKAGE_PATH, getLocaleFileName(locale));
}

/**
 * Set nested value in object using dot notation
 */
function setNestedValue(
  obj: Record<string, any>,
  path: string,
  value: string,
  createMissing = true
): boolean {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!(key in current)) {
      if (!createMissing) {
        return false;
      }
      current[key] = {};
    } else if (typeof current[key] !== 'object' || current[key] === null) {
      if (!createMissing) {
        return false;
      }
      current[key] = {};
    }

    current = current[key];
  }

  const finalKey = keys[keys.length - 1];
  current[finalKey] = value;
  return true;
}

/**
 * Read locale file
 */
async function readLocaleFile(locale: Locale): Promise<Record<string, any>> {
  try {
    const filePath = getLocaleFilePath(locale);
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to read locale file for ${locale}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Write locale file
 */
async function writeLocaleFile(
  locale: Locale,
  data: Record<string, any>
): Promise<void> {
  try {
    const filePath = getLocaleFilePath(locale);
    const content = JSON.stringify(data, null, 2) + '\n';
    await writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to write locale file for ${locale}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get translation value from nested object using dot notation
 */
function getNestedValue(
  obj: Record<string, any>,
  path: string
): string | undefined {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Get all translation keys from a locale object
 */
function getAllKeysFromObject(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      keys.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...getAllKeysFromObject(value, fullKey));
    }
  }

  return keys;
}

/**
 * Check if a translation key exists and get information about it
 */
export async function checkTranslationKey(
  key: string
): Promise<TranslationKeyInfo> {
  const availableLocales = getAvailableLocales();
  const translations: Record<string, string> = {};
  const availableIn: Locale[] = [];
  const missingIn: Locale[] = [];

  // Check each locale for the key
  for (const locale of availableLocales) {
    try {
      // Get the locale data dynamically
      const localeData = (locales as any)[
        locale.replace(/[@-]/g, '').toLowerCase()
      ];

      if (!localeData) {
        missingIn.push(locale);
        continue;
      }

      const value = getNestedValue(localeData, key);

      if (value !== undefined) {
        translations[locale] = value;
        availableIn.push(locale);
      } else {
        missingIn.push(locale);
      }
    } catch (error) {
      missingIn.push(locale);
    }
  }

  return {
    exists: availableIn.length > 0,
    availableLocales: availableIn,
    missingLocales: missingIn,
    translations: translations as Record<Locale, string>,
    totalLocales: availableLocales.length,
  };
}

/**
 * Get translation values for a specific key across all locales
 */
export async function getTranslations(
  key: string
): Promise<Record<Locale, string | undefined>> {
  const availableLocales = getAvailableLocales();
  const result: Record<string, string | undefined> = {};

  for (const locale of availableLocales) {
    try {
      const localeData = (locales as any)[
        locale.replace(/[@-]/g, '').toLowerCase()
      ];
      result[locale] = localeData ? getNestedValue(localeData, key) : undefined;
    } catch (error) {
      result[locale] = undefined;
    }
  }

  return result as Record<Locale, string | undefined>;
}

/**
 * List all available translation keys with optional filtering
 */
export async function listTranslationKeys(
  options: ListTranslationKeysOptions = {}
): Promise<ListTranslationKeysResult> {
  const { prefix, limit, locale } = options;

  // Use English as base locale for key discovery if no specific locale specified
  const targetLocale = locale || 'en';

  try {
    const localeData = locales[targetLocale.replace(/[@-]/g, '').toLowerCase()];

    if (!localeData) {
      return {
        keys: [],
        total: 0,
        truncated: false,
      };
    }

    let allKeys = getAllKeysFromObject(localeData);

    // Filter by prefix if provided
    if (prefix) {
      allKeys = allKeys.filter((key) => key.startsWith(prefix));
    }

    // Sort keys alphabetically
    allKeys.sort();

    const total = allKeys.length;
    const truncated = limit ? allKeys.length > limit : false;

    // Apply limit if specified
    if (limit) {
      allKeys = allKeys.slice(0, limit);
    }

    return {
      keys: allKeys,
      total,
      truncated,
    };
  } catch (error) {
    return {
      keys: [],
      total: 0,
      truncated: false,
    };
  }
}

/**
 * Validate translation key usage and provide suggestions
 */
export async function validateTranslationUsage(
  key: string
): Promise<TranslationValidationResult> {
  const errors: string[] = [];
  const suggestions: string[] = [];

  // Basic format validation
  if (!key) {
    errors.push('Translation key cannot be empty');
    return { valid: false, errors, suggestions };
  }

  // Check for invalid characters
  if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
    errors.push(
      'Translation key contains invalid characters. Use only letters, numbers, dots, hyphens, and underscores.'
    );
  }

  // Check for leading/trailing dots
  if (key.startsWith('.') || key.endsWith('.')) {
    errors.push('Translation key cannot start or end with a dot');
  }

  // Check for consecutive dots
  if (key.includes('..')) {
    errors.push('Translation key cannot contain consecutive dots');
  }

  // Check for very long keys
  if (key.length > 100) {
    errors.push('Translation key is too long (max 100 characters)');
    suggestions.push('Consider using shorter, more concise key names');
  }

  // Check if key exists
  const keyInfo = await checkTranslationKey(key);

  // Provide suggestions based on key structure
  const parts = key.split('.');
  if (parts.length === 1) {
    suggestions.push(
      'Consider using namespaced keys (e.g., "page.action" instead of "action")'
    );
  }

  if (parts.some((part) => part.length < 2)) {
    suggestions.push('Avoid very short key segments (less than 2 characters)');
  }

  // Check for common naming patterns
  if (!keyInfo.exists) {
    suggestions.push('Key does not exist in any locale');

    // Suggest similar keys if possible
    try {
      const allKeys = await listTranslationKeys({ limit: 1000 });
      const similarKeys = allKeys.keys.filter((k) =>
        k.toLowerCase().includes(key.toLowerCase().substring(0, 5))
      );

      if (similarKeys.length > 0) {
        suggestions.push(
          `Similar keys found: ${similarKeys.slice(0, 3).join(', ')}`
        );
      }
    } catch (error) {
      // Ignore errors when looking for similar keys
    }
  } else {
    // Check for missing translations
    if (keyInfo.missingLocales.length > 0) {
      suggestions.push(
        `Missing in locales: ${keyInfo.missingLocales.join(', ')}`
      );
    }
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    suggestions,
  };
}

/**
 * Set translations for a specific key across specified locales
 */
export async function setTranslation(
  options: SetTranslationOptions
): Promise<SetTranslationResult> {
  const { key, translations, createMissingKeys = true } = options;
  const updatedLocales: Locale[] = [];
  const failedLocales: Locale[] = [];
  const errors: string[] = [];

  // Validate key format first
  const validation = await validateTranslationUsage(key);
  if (!validation.valid) {
    return {
      success: false,
      updatedLocales: [],
      failedLocales: Object.keys(translations) as Locale[],
      errors: validation.errors,
    };
  }

  // Process each locale
  for (const [locale, value] of Object.entries(translations)) {
    if (!value) continue; // Skip empty values

    try {
      // Validate locale
      if (!getAvailableLocales().includes(locale as Locale)) {
        errors.push(`Unknown locale: ${locale}`);
        failedLocales.push(locale as Locale);
        continue;
      }

      // Read current locale file
      const localeData = await readLocaleFile(locale as Locale);

      // Set the new value
      const success = setNestedValue(localeData, key, value, createMissingKeys);

      if (!success) {
        errors.push(
          `Failed to set key "${key}" in locale ${locale} (missing parent keys)`
        );
        failedLocales.push(locale as Locale);
        continue;
      }

      // Write back to file
      await writeLocaleFile(locale as Locale, localeData);
      updatedLocales.push(locale as Locale);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push(`Failed to update ${locale}: ${errorMessage}`);
      failedLocales.push(locale as Locale);
    }
  }

  return {
    success: updatedLocales.length > 0 && failedLocales.length === 0,
    updatedLocales,
    failedLocales,
    errors,
  };
}
