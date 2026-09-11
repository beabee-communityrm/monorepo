import { COUNTRY_CODES } from '@beabee/beabee-common';

import type { SelectItem } from '../types';

/**
 * Country options for a select, labelled and sorted in the given locale.
 *
 * @param baseLocale Base locale to translate the country code to
 */
export function getCountryItems(baseLocale: string): SelectItem<string>[] {
  const names = new Intl.DisplayNames([baseLocale], { type: 'region' });
  return COUNTRY_CODES.map((id) => ({ id, label: names.of(id) || id })).sort(
    (a, b) => a.label.localeCompare(b.label, baseLocale)
  );
}
