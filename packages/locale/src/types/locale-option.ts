import type { LocaleContext } from '../locale-context.ts';
import type { BaseLocale } from './base-locale.ts';
import type { Locale } from './locale.ts';

/**
 * Configuration for a single locale
 */
export interface LocaleOption {
  /** The base locale code (e.g., "de" for "de@informal") */
  baseLocale: BaseLocale;
  /** The full name of the locale */
  name: string;
  /** The display name shown to users */
  displayName: string;
  /** The locale used in the admin interface */
  adminLocale: Locale;
  /** The locale to fall back to when a translation is missing */
  fallbackLocale?: Locale;
  /** Whether the locale is available in callouts and backend */
  availableIn: LocaleContext[];
}

export type LocaleOptions = Record<Locale, LocaleOption>;
