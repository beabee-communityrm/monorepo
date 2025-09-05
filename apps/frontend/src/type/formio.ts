import type {
  GeocodingFeature,
  GeocodingOptions,
  GeocodingPlaceType,
} from '@maptiler/client';

/**
 * Base interface for all address provider options
 * Combines provider configuration and search options into a single interface
 */
export interface FormioAddressProviderOptions {
  params: {
    query?: string;
  };
}

/**
 * Form.io compatible address component structure
 */
export interface FormioAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/**
 * Form.io compatible address result structure
 */
export interface FormioAddressResult {
  place_id: string;
  place_name: string; // MapTiler's native formatted address
  formatted_address: string; // For compatibility with Google Maps format
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: FormioAddressComponent[];
  types: string[];
}

export interface FormioMapTilerProviderParams extends GeocodingOptions {
  language: string; // Response language (ISO 639-1 code)
  country?: string[]; // Country code restrictions (ISO 3166-1 alpha-2) - optional
  limit: number; // Maximum number of results
  types: GeocodingPlaceType[]; // Result types: address, poi, neighborhood, city, etc.
  query?: string; // Search query
}

/**
 * MapTiler provider configuration options
 */
export interface FormioMapTilerProviderOptions
  extends FormioAddressProviderOptions {
  params: FormioMapTilerProviderParams;
}

export interface FormioMapTilerAddressResult extends FormioAddressResult {
  maptiler: GeocodingFeature;
}
