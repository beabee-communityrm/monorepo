import { currentLocaleConfig } from '@lib/i18n';
import { geocoding } from '@lib/maptiler';
import {
  type FeatureHierarchy,
  type GeocodingFeature,
  type GeocodingSearchResult,
} from '@maptiler/client';
import type { MapTilerAddressResult, MapTilerProviderOptions } from '@type';

import { BaseAddressProvider } from './BaseAddressProvider';

/**
 * Address provider for MapTiler Geocoding API
 *
 * Provides address lookup and geocoding functionality using MapTiler's
 * geocoding service. Supports international addresses with configurable
 * language and country restrictions.
 *
 * @see https://docs.maptiler.com/geocoding-api/
 */
export class MapTilerAddressProvider extends BaseAddressProvider<MapTilerProviderOptions> {
  /**
   * Unique identifier for the MapTiler provider
   * Used by Form.io to register and identify this provider
   */
  static get name() {
    return 'maptiler';
  }

  /**
   * Human-readable name displayed in Form.io builder UI
   */
  static get displayName() {
    return 'MapTiler';
  }

  /**
   * Creates a new MapTiler address provider instance
   * @param options - Configuration options including search parameters
   */
  constructor(options: Partial<MapTilerProviderOptions> = {}) {
    super(options);
  }

  /**
   * Default configuration options for MapTiler API
   */
  protected get defaultOptions(): MapTilerProviderOptions {
    return {
      params: {
        language: currentLocaleConfig.value.baseLocale, // Current frontend language
        limit: 10, // Maximum number of results
        types: ['address', 'poi', 'neighbourhood', 'locality'], // Result types
      },
    };
  }

  /**
   * Property path in the API response containing the address results
   * MapTiler uses 'features' for the results array
   */
  protected get responseProperty(): string {
    return 'features';
  }

  /**
   * Property path in each address result used for display
   * MapTiler uses 'place_name' for the formatted address
   */
  protected get displayValueProperty(): string {
    return 'place_name';
  }

  /**
   * Generates the API request URL for MapTiler geocoding
   * Required by BaseAddressProvider but not used since we use the MapTiler client directly
   * @param options - Request options
   * @returns Empty string as we don't use direct URL requests
   */
  protected getRequestUrl(): string {
    // Not used - we use the MapTiler client directly in makeRequest
    throw new Error('Not implemented');
  }

  /**
   * Merges provider options with request-specific options
   * @param options - Request-specific options to merge
   * @returns Merged options object
   */
  protected getRequestOptions(
    options: Partial<MapTilerProviderOptions>
  ): MapTilerProviderOptions {
    return {
      ...super.getRequestOptions(options),
      params: {
        ...this.options.params,
        ...options.params,
        // Always use current language from reactive locale config
        language: currentLocaleConfig.value.baseLocale,
      },
    };
  }

  /**
   * Makes request using MapTiler client
   * @param options - Request options
   * @returns Promise resolving to the API response
   */
  protected async makeRequest(
    options: Partial<MapTilerProviderOptions> = {}
  ): Promise<GeocodingSearchResult> {
    const reqOptions = this.getRequestOptions(options);

    if (!reqOptions.params.query) {
      throw new Error('Query is required');
    }

    return await geocoding.forward(reqOptions.params.query, reqOptions.params);
  }

  /**
   * Searches for addresses using MapTiler Geocoding API
   * @param query - Address search query (e.g., "München Haupt")
   * @param options - Additional search options
   * @returns Promise resolving to array of transformed address results
   */
  async search(
    query: string,
    options: Partial<MapTilerProviderOptions> = {}
  ): Promise<MapTilerAddressResult[]> {
    const requestOptions = this.getRequestOptions(options);
    requestOptions.params.query = query;

    const result = await this.makeRequest(requestOptions);
    const features = result.features || [];

    return features.map((feature) => this.transformMapTilerResult(feature));
  }

  /**
   * Transforms MapTiler API response format to Form.io-compatible format
   * Converts MapTiler's feature-based structure to Google Maps-like format
   * for compatibility with existing Form.io address components
   *
   * @param feature - Raw feature object from MapTiler API
   * @returns Transformed address object compatible with Form.io
   */
  private transformMapTilerResult(
    feature: GeocodingFeature
  ): MapTilerAddressResult {
    const context = feature.context || [];

    // Extract address components from MapTiler's context array
    const country =
      context.find((ctx: FeatureHierarchy) => ctx.id.startsWith('country'))
        ?.text || '';
    const region =
      context.find((ctx: FeatureHierarchy) => ctx.id.startsWith('region'))
        ?.text || '';
    const postcode =
      context.find((ctx: FeatureHierarchy) => ctx.id.startsWith('postcode'))
        ?.text || '';
    const place =
      context.find((ctx: FeatureHierarchy) => ctx.id.startsWith('place'))
        ?.text || '';
    const locality =
      context.find((ctx: FeatureHierarchy) => ctx.id.startsWith('locality'))
        ?.text || '';

    const result: MapTilerAddressResult = {
      // Standard Form.io address properties
      place_id: feature.id,
      place_name: feature.place_name, // MapTiler's native property
      formatted_address: feature.place_name, // For compatibility

      // Geographic coordinates
      geometry: {
        location: {
          lat: feature.center[1], // MapTiler uses [lng, lat] order
          lng: feature.center[0],
        },
      },

      // Structured address components (Google Maps compatible)
      address_components: [
        {
          long_name: feature.text,
          short_name: feature.text,
          types: ['street_number'],
        },
        { long_name: place, short_name: place, types: ['route'] },
        { long_name: locality, short_name: locality, types: ['locality'] },
        {
          long_name: region,
          short_name: region,
          types: ['administrative_area_level_1'],
        },
        { long_name: postcode, short_name: postcode, types: ['postal_code'] },
        { long_name: country, short_name: country, types: ['country'] },
      ].filter((comp) => comp.long_name), // Remove empty components

      // Address types for categorization
      types: feature.place_type,

      // Preserve MapTiler-specific properties for advanced usage
      maptiler: feature,
    };

    return result;
  }
}
