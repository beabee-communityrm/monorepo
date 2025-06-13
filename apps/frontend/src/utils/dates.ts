import type { BaseLocale } from '@beabee/locale';
import {
  formatDistanceLocale as _formatDistanceLocale,
  formatLocale as _formatLocale,
} from '@beabee/vue';

import { i18n } from '../lib/i18n';

export function formatDistanceLocale(
  firstDate: Date,
  secondDate: Date
): string {
  return _formatDistanceLocale(
    firstDate,
    secondDate,
    i18n.global.locale.value as BaseLocale
  );
}

export function formatLocale(date: Date, formatString: string): string {
  return _formatLocale(
    date,
    formatString,
    i18n.global.locale.value as BaseLocale
  );
}
