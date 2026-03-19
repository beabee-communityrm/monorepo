import { config } from './config.ts';
import type { LocaleContext } from './locale-context.ts';
import type { Locale } from './types/locale.ts';

export function isLocale(s: string): s is Locale {
  return s in config;
}

export function isAvailableInContext(
  s: Locale,
  context: LocaleContext
): boolean {
  return config[s].availableIn.includes(context);
}
