import type { GeocodingOptions as MapTilerGeocodingOptions } from '@maptiler/client';

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
 * MapTiler provider configuration options
 */
export interface FormioMapTilerProviderOptions
  extends FormioAddressProviderOptions {
  params: MapTilerGeocodingOptions & {
    query?: string; // Search query
  };
}
