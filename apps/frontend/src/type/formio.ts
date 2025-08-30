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
