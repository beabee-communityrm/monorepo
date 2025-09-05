import { type UnifiedAddress } from '@beabee/beabee-common';

import { AddressFormatter } from '@lib/address.formatter';
import { currentLocaleConfig } from '@lib/i18n';

import env from '../env';
import { geocoding } from '../lib/maptiler';

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<UnifiedAddress | undefined> {
  if (!env.maptilerKey) {
    return undefined;
  }

  const data = await geocoding.reverse([lng, lat], {
    language: currentLocaleConfig.value.baseLocale,
    types: ['address', 'postal_code', 'municipality', 'county', 'region'],
  });

  if (!data.features.length) {
    return undefined;
  }

  return AddressFormatter.fromMapTiler(data.features[0]);
}
