import { type CalloutResponseAnswerAddress } from '@beabee/beabee-common';
import { type GeocodingFeature } from '@maptiler/client';
import { geocoding } from '../lib/maptiler';
import env from '../env';
import { currentLocaleConfig } from '@lib/i18n';

export interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  features: {
    text: string;
    types: string[];
  }[];
}

export function featureToAddress(
  feature: GeocodingFeature
): CalloutResponseAnswerAddress {
  return {
    formatted_address: feature.place_name,
    geometry: {
      location: { lat: feature.center[1], lng: feature.center[0] },
    },
  };
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodeResult | undefined> {
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

  const result: GeocodeResult = {
    ...featureToAddress(data.features[0]),
    features: data.features.map((feature) => ({
      text: feature.text,
      types: feature.place_type,
    })),
  };

  const addressFeature = data.features.find((f) =>
    f.place_type.includes('address')
  );

  // Add street address number if available as a separate feature for formatting
  if (addressFeature && addressFeature.address) {
    result.features.push({
      text: addressFeature.address,
      types: ['street_number'],
    });
  }

  return result;
}

export function formatGeocodeResult(
  result: GeocodeResult,
  pattern: string
): string {
  return pattern.replace(/{([\w|]+)}/g, (_m, keys) => {
    for (const key of keys.split('|')) {
      const text = result.features.find((a) => a.types.includes(key))?.text;
      if (text) {
        return text;
      }
    }
    return '???';
  });
}
