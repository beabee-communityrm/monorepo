import { currentLocaleConfig } from '@lib/i18n';
import { geocoding } from '@lib/maptiler';
import {
  type FeatureHierarchy,
  type GeocodingFeature,
  type GeocodingSearchResult,
} from '@maptiler/client';
import type {
  FormioAddressResult,
  MapTilerProviderOptions,
  MapTilerSearchOptions,
} from '@type/maptiler';

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
export class MapTilerAddressProvider extends BaseAddressProvider<
  Partial<MapTilerProviderOptions>
> {
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
        country: this.options.callout?.geocodeCountries || [], // Callout-specific country restrictions
        limit: 10, // Maximum number of results
        types: ['address', 'poi', 'neighbourhood', 'city'], // Result types
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
   * Alternative display value property
   * Fallback to 'formatted_address' for compatibility
   */
  protected get alternativeDisplayValueProperty(): string {
    return 'formatted_address';
  }

  /**
   * Generates the API request URL for MapTiler geocoding
   * Required by BaseAddressProvider but not used since we use the MapTiler client directly
   * @param options - Request options
   * @returns Empty string as we don't use direct URL requests
   */
  protected getRequestUrl(options?: Partial<MapTilerSearchOptions>): string {
    // Not used - we use the MapTiler client directly in makeRequest
    return options?.query || '';
  }

  /**
   * Makes request using MapTiler client
   * @param options - Request options
   * @returns Promise resolving to the API response
   */
  protected async makeRequest(
    options: Partial<MapTilerSearchOptions> = {}
  ): Promise<GeocodingSearchResult> {
    const requestOptions = this.getRequestOptions(options);
    const params = requestOptions.params;

    const geocodingOptions = {
      language: params.language || 'en',
      limit: params.limit || 10,
      types: params.types || ['address', 'poi', 'neighbourhood', 'city'],
      ...(params.country &&
        params.country.length > 0 && { country: params.country }),
    };

    return await geocoding.forward(params.query || '', geocodingOptions);
  }

  /**
   * Searches for addresses using MapTiler Geocoding API
   * @param query - Address search query (e.g., "München Haupt")
   * @param options - Additional search options
   * @returns Promise resolving to array of transformed address results
   */
  async search(
    query: string,
    options: Partial<MapTilerSearchOptions> = {}
  ): Promise<FormioAddressResult[]> {
    const requestOptions = this.getRequestOptions(options);
    const params = (requestOptions.params = requestOptions.params || {});
    params.query = query;

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
  ): FormioAddressResult {
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

    return {
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
      maptiler: {
        id: feature.id,
        type: feature.place_type[0],
        relevance: feature.relevance,
        bbox: feature.bbox,
        center: feature.center,
      },
    };
  }

  /**
   * Extracts the display value from an address result
   * Used by Form.io to show the selected address in the form
   *
   * @param address - Address result object (transformed from MapTiler format)
   * @returns String representation of the address for display
   */
  getDisplayValue(address: FormioAddressResult | string): string {
    if (typeof address === 'string') {
      return address;
    }

    const displayedProperty = this.hasOwnProperty.call(
      address,
      this.displayValueProperty
    )
      ? this.displayValueProperty
      : this.alternativeDisplayValueProperty;

    return (
      (address as unknown as Record<string, string>)[displayedProperty] || ''
    );
  }

  /**
   * Attaches autocomplete functionality to an input element
   * This method would be called by Form.io to enable address autocomplete
   *
   * @param elem - HTML input element to attach autocomplete to
   * @param index - Index of the form field
   * @param onSelectAddress - Callback function when address is selected
   */
  attachAutocomplete(
    elem: HTMLInputElement,
    index: number,
    onSelectAddress: (
      place: FormioAddressResult,
      elem: HTMLInputElement,
      index: number
    ) => void
  ) {
    // Simple autocomplete implementation using MapTiler search
    let searchTimeout: ReturnType<typeof setTimeout>;

    elem.addEventListener('input', async (event) => {
      const target = event.target as HTMLInputElement;
      const query = target.value.trim();

      if (query.length < 3) return;

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        try {
          const results = await this.search(query);
          if (results.length > 0) {
            // Use the first result for autocomplete
            onSelectAddress(results[0], elem, index);
          }
        } catch {
          // Handle autocomplete errors silently
          // Could be logged to monitoring service in production
        }
      }, 300);
    });
  }
}
