import type { CalloutResponseAnswerAddress } from '@beabee/beabee-common';

import { AddressFormatter } from '@lib/address.formatter';
import { currentLocaleConfig } from '@lib/i18n';

import env from '../env';
import { geocoding } from '../lib/maptiler';

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<CalloutResponseAnswerAddress | undefined> {
  if (!env.maptilerKey) {
    return undefined;
  }

  const data = await geocoding.reverse([lng, lat], {
    language: currentLocaleConfig.value.baseLocale,
  });

  return data.features.length > 0
    ? AddressFormatter.fromMapTiler(data.features[0])
    : undefined;
}
