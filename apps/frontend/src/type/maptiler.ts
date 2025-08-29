import type { BBox, GeocodingOptions, Position } from '@maptiler/client';

/**
 * MapTiler provider configuration options
 */
export interface MapTilerProviderOptions {
  params: {
    language: string; // Response language (ISO 639-1 code)
    country: string[]; // Country code restrictions (ISO 3166-1 alpha-2)
    limit: number; // Maximum number of results
    types: string[]; // Result types: address, poi, neighborhood, city, etc.
  };
  // Callout-specific options
  callout?: {
    geocodeCountries?: string[]; // From callout.responseViewSchema?.map?.geocodeCountries
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
  maptiler: {
    id: string;
    type: string;
    relevance: number;
    bbox: BBox;
    center: Position;
  };
}

/**
 * MapTiler search request options
 */
export interface MapTilerSearchOptions extends GeocodingOptions {
  query: string;
}
