import type { BaseLocale } from '@beabee/locale';

import { type Locale, format, formatDistance } from 'date-fns';
import { de, enGB, fr, it, nl, pt, ru } from 'date-fns/locale';

const locales: Record<BaseLocale, Locale> = {
  en: enGB,
  de,
  nl,
  pt,
  ru,
  it,
  fr,
};

/**
 * Format distance between two dates with locale support
 * @param firstDate - The first date
 * @param secondDate - The second date
 * @param locale - The locale key (defaults to 'en')
 * @returns Formatted distance string
 */
export function formatDistanceLocale(
  firstDate: Date,
  secondDate: Date,
  locale: BaseLocale = 'en'
): string {
  return formatDistance(firstDate, secondDate, {
    locale: locales[locale],
  });
}

/**
 * Format date with locale support
 * @param date - The date to format
 * @param formatString - The format string
 * @param locale - The locale key (defaults to 'en')
 * @returns Formatted date string
 */
export function formatLocale(
  date: Date,
  formatString: string,
  locale: BaseLocale = 'en'
): string {
  return format(date, formatString, {
    locale: locales[locale],
  });
}
