import type { BaseLocale } from '@beabee/locale';

import { type Locale, format, formatDistance } from 'date-fns';
import { de, el, enGB as en, fr, it, nl, pt, ru, uk } from 'date-fns/locale';

import { i18n } from '../lib/i18n';

export const DateFnsLocales: Record<BaseLocale, Locale> = {
  en,
  de,
  nl,
  pt,
  ru,
  uk,
  it,
  fr,
  el,
};

/**
 * Format distance between two dates with locale support
 * @param firstDate - The first date
 * @param secondDate - The second date
 * @returns Formatted distance string
 */
export function formatDistanceLocale(
  firstDate: Date,
  secondDate: Date
): string {
  return formatDistance(firstDate, secondDate, {
    locale: DateFnsLocales[i18n.global.locale.value as BaseLocale],
  });
}

/**
 * Format date with locale support
 * @param date - The date to format
 * @param formatString - The format string
 * @returns Formatted date string
 */
export function formatLocale(date: Date, formatString: string): string {
  return format(date, formatString, {
    locale: DateFnsLocales[i18n.global.locale.value as BaseLocale],
  });
}
