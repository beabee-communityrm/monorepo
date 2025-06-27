import type { Locale } from '@beabee/locale';

/**
 * Translation key validation result
 */
export interface TranslationKeyInfo {
  /** Whether the key exists */
  exists: boolean;
  /** Which locales have this key */
  availableLocales: Locale[];
  /** Missing locales for this key */
  missingLocales: Locale[];
  /** Translation values by locale */
  translations: Record<Locale, string>;
  /** Total number of available locales */
  totalLocales: number;
}

/**
 * Options for listing translation keys
 */
export interface ListTranslationKeysOptions {
  /** Filter keys by prefix */
  prefix?: string;
  /** Maximum number of keys to return */
  limit?: number;
  /** Locale to check for existence (default: all) */
  locale?: Locale;
}

/**
 * Result for listing translation keys
 */
export interface ListTranslationKeysResult {
  /** Array of translation keys */
  keys: string[];
  /** Total number of keys found */
  total: number;
  /** Whether results were truncated due to limit */
  truncated: boolean;
}

/**
 * Translation validation result
 */
export interface TranslationValidationResult {
  /** Whether the key format is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Suggestions for improvement */
  suggestions: string[];
}
