import type { ADDRESS_COMPONENT_TYPE } from '../constants';

export interface Address {
  line1: string;
  line2?: string | undefined;
  city: string;
  postcode: string;
}

/**
 * Unified address data structure for all geocoding operations
 * This interface standardizes address data across different providers (MapTiler, Google, manual)
 */
export interface UnifiedAddress {
  id: string;
  formatted_address: string;
  components: AddressComponent[];
  geometry: {
    lat: number;
    lng: number;
  };
  source: 'maptiler' | 'formio';
  metadata?: Record<string, any>;
}

/**
 * Standardized address component structure
 */
export interface AddressComponent {
  type: ADDRESS_COMPONENT_TYPE;
  value: string;
  confidence?: number;
}
