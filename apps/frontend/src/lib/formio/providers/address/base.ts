/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormioAddressProviderOptions } from '@type';

/**
 * Abstract base class for address providers in Form.io
 *
 * This class provides a common interface and default implementations
 * for address lookup and geocoding functionality. Extend this class
 * to create custom address providers for different geocoding services.
 */
export abstract class BaseAddressProvider<
  T extends FormioAddressProviderOptions,
> {
  /**
   * Unique identifier for the provider
   * Used internally by Form.io to identify and register the provider
   */
  static get name(): string {
    throw new Error('Method name must be implemented');
  }

  /**
   * Human-readable display name for the provider
   * Shown in the Form.io builder UI when selecting address providers
   */
  static get displayName(): string {
    throw new Error('Method displayName must be implemented');
  }

  /** Configuration options for the provider */
  protected options: T = {} as T;

  /**
   * Creates a new address provider instance
   * @param options - Configuration options, merged with defaultOptions
   */
  constructor(options: Partial<T> = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
      params: {
        ...this.defaultOptions.params,
        ...options.params,
      },
    };
  }

  /**
   * Hook called before merging options
   * Override in subclasses to modify options before merging
   */
  protected beforeMergeOptions(): void {
    // Default implementation does nothing
  }

  /**
   * Default configuration options
   * Override in subclasses to provide service-specific defaults
   */
  protected get defaultOptions(): T {
    return {} as T;
  }

  /**
   * Property name used for the search query parameter
   * Most geocoding APIs use 'query', but some may use 'q' or 'search'
   */
  protected get queryProperty(): string {
    return 'query';
  }

  /**
   * Property path in the API response containing the address results
   * For example: 'features' for MapTiler, 'results' for Google, 'data' for custom APIs
   */
  protected get responseProperty(): string | null {
    return null;
  }

  /**
   * Property path in each address result used for display
   * For example: 'formatted_address' for Google, 'place_name' for MapTiler
   */
  protected get displayValueProperty(): string | null {
    return null;
  }

  /**
   * Serializes parameters into a URL query string
   * @param params - Object containing query parameters
   * @returns URL-encoded query string
   */
  protected serialize(params: any): string {
    return Object.entries(params)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
      )
      .join('&');
  }

  /**
   * Merges provider options with request-specific options
   * @param options - Request-specific options to merge
   * @returns Merged options object
   */
  protected getRequestOptions(options: Partial<T>): T {
    return { ...this.options, ...options };
  }

  /**
   * Generates the API request URL for address lookup
   * Must be implemented by subclasses to provide service-specific URL construction
   * @param options - Request options that may affect URL generation
   */
  protected abstract getRequestUrl(options?: any): string;

  /**
   * Makes the HTTP request to the geocoding service
   * @param options - Request options
   * @returns Promise resolving to the API response
   */
  protected makeRequest(options: any = {}): Promise<any> {
    const url = this.getRequestUrl(options);
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    }).then((response) => response.json());
  }

  /**
   * Searches for addresses based on a query string
   * @param query - The address search query (e.g., "München Haupt")
   * @param options - Additional search options
   * @returns Promise resolving to an array of address results
   */
  async search(query: string, options: Partial<T> = {}): Promise<any[]> {
    const requestOptions = this.getRequestOptions(options);
    requestOptions.params.query = query;

    const result = await this.makeRequest(requestOptions);
    return this.responseProperty ? result[this.responseProperty] || [] : result;
  }

  /**
   * Extracts the display value from an address result
   * Used by Form.io to show the selected address in the form
   * @param address - Address result object from the search
   * @returns String representation of the address for display
   */
  getDisplayValue(address: any): string {
    return this.displayValueProperty
      ? address[this.displayValueProperty] || ''
      : String(address);
  }
}
