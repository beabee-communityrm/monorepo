import type {
  GeocodingFeature,
  GeocodingOptions,
  GeocodingPlaceType,
} from '@maptiler/client';

import type {
  FormioAddressProviderOptions,
  FormioAddressResult,
} from './formio';

export interface MapTilerProviderParams extends GeocodingOptions {
  language: string; // Response language (ISO 639-1 code)
  country?: string[]; // Country code restrictions (ISO 3166-1 alpha-2) - optional
  limit: number; // Maximum number of results
  types: GeocodingPlaceType[]; // Result types: address, poi, neighborhood, city, etc.
  query?: string; // Search query
}

/**
 * MapTiler provider configuration options
 */
export interface MapTilerProviderOptions extends FormioAddressProviderOptions {
  params: MapTilerProviderParams;
}

export interface MapTilerAddressResult extends FormioAddressResult {
  maptiler: GeocodingFeature;
}
