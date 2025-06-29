import { format, formatDistance } from 'date-fns';
import { de, el, enGB, fr, it, nl, pt, ru } from 'date-fns/locale';

import { i18n } from '../lib/i18n';

const { locale } = i18n.global;
const locales = { en: enGB, de, nl, pt, ru, it, el, fr };

export function formatDistanceLocale(
  firstDate: Date,
  secondDate: Date
): string {
  return formatDistance(firstDate, secondDate, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - locale is interfered as string which is not
    locale: locales[locale.value],
  });
}

export function formatLocale(date: Date, formatString: string): string {
  return format(date, formatString, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - locale is interfered as string which is not
    locale: locales[locale.value],
  });
}
