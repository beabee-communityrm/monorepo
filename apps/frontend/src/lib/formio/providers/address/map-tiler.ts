import { AddressFormatter } from '@lib/address.formatter';
import { currentLocaleConfig } from '@lib/i18n';
import { geocoding } from '@lib/maptiler';
import {
  type GeocodingFeature,
  type GeocodingSearchResult,
} from '@maptiler/client';
import type {
  FormioMapTilerAddressResult,
  FormioMapTilerProviderOptions,
} from '@type';

import { BaseAddressProvider } from './base';

/**
 * Address provider for MapTiler Geocoding API
 *
 * Provides address lookup and geocoding functionality using MapTiler's
 * geocoding service. Supports international addresses with configurable
 * language and country restrictions.
 *
 * @see https://docs.maptiler.com/geocoding-api/
 */
export class MapTilerAddressProvider extends BaseAddressProvider<FormioMapTilerProviderOptions> {
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
  constructor(options: Partial<FormioMapTilerProviderOptions> = {}) {
    super(options);
  }

  /**
   * Default configuration options for MapTiler API
   */
  protected get defaultOptions(): FormioMapTilerProviderOptions {
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
    options: Partial<FormioMapTilerProviderOptions>
  ): FormioMapTilerProviderOptions {
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
    options: Partial<FormioMapTilerProviderOptions> = {}
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
    options: Partial<FormioMapTilerProviderOptions> = {}
  ): Promise<FormioMapTilerAddressResult[]> {
    const requestOptions = this.getRequestOptions(options);
    requestOptions.params.query = query;

    const result = await this.makeRequest(requestOptions);
    const features = result.features || [];

    return features.map((feature) => this.transformMapTilerResult(feature));
  }

  /**
   * Transforms MapTiler API response format to Form.io-compatible format
   * Uses the centralized AddressFormatter for consistent transformations
   *
   * @param feature - Raw feature object from MapTiler API
   * @returns Transformed address object compatible with Form.io
   */
  private transformMapTilerResult(
    feature: GeocodingFeature
  ): FormioMapTilerAddressResult {
    // Use centralized AddressFormatter for consistent transformation
    const unifiedAddress = AddressFormatter.fromMapTiler(feature);
    const formioAddress = AddressFormatter.toFormio(unifiedAddress);

    // Preserve MapTiler-specific properties and add to result
    const result: FormioMapTilerAddressResult = {
      ...formioAddress,
      maptiler: feature,
    };

    return result;
  }
}
