import type { Locale } from "./locale.js";
import type { BaseLocale } from "./base-locale.js";

/**
 * Configuration for a single locale
 */
export interface LocaleConfig {
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
}
