import {
  ADDRESS_COMPONENT_TYPE,
  type AddressComponent,
  type CalloutResponseAnswerAddress,
  type UnifiedAddress,
} from '@beabee/beabee-common';

import type { GeocodingFeature } from '@maptiler/client';
import type { FormioAddressResult } from '@type/formio';

/**
 * Central address formatter for unified address data handling
 *
 * This class provides standardized methods for:
 * - Transforming addresses between different formats (MapTiler, Google, Form.io)
 * - Formatting addresses using patterns
 * - Converting between unified and provider-specific formats
 */
export class AddressFormatter {
  /**
   * Formats a unified address using a pattern string
   * Supports placeholder replacement like: "{street_number} {street}, {locality}, {postal_code} {country}"
   *
   * @param address - Unified address to format
   * @param pattern - Pattern string with placeholders
   * @returns Formatted address string
   */
  static format(address: UnifiedAddress, pattern: string): string {
    return pattern.replace(/{([\w|]+)}/g, (_match, keys) => {
      for (const key of keys.split('|')) {
        const component = address.components.find((comp) => comp.type === key);
        if (component?.value) {
          return component.value;
        }
      }
      return '???';
    });
  }

  /**
   * Transforms MapTiler GeocodingFeature to UnifiedAddress
   *
   * @param feature - MapTiler geocoding feature
   * @returns Unified address
   */
  static fromMapTiler(feature: GeocodingFeature): UnifiedAddress {
    const context = feature.context || [];
    const components: AddressComponent[] = [];

    // Extract components from MapTiler context
    const country = context.find((ctx) => ctx.id.startsWith('country'));
    const region = context.find((ctx) => ctx.id.startsWith('region'));
    const postcode = context.find((ctx) => ctx.id.startsWith('postcode'));
    const locality = context.find((ctx) => ctx.id.startsWith('locality'));

    // Build components array
    if (feature.address) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.STREET_NUMBER,
        value: feature.address,
      });
    }

    if (feature.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.STREET,
        value: feature.text,
      });
    }

    if (locality?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.LOCALITY,
        value: locality.text,
      });
    }

    if (region?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.REGION,
        value: region.text,
      });
    }

    if (postcode?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.POSTAL_CODE,
        value: postcode.text,
      });
    }

    if (country?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.COUNTRY,
        value: country.text,
      });
    }

    return {
      id: feature.id,
      formatted_address: feature.place_name,
      components,
      geometry: {
        lat: feature.center[1],
        lng: feature.center[0],
      },
      source: 'maptiler',
      metadata: {
        maptiler: feature,
      },
    };
  }

  /**
   * Transforms Form.io address result to UnifiedAddress
   *
   * @param result - Form.io address result
   * @returns Unified address
   */
  static fromFormio(result: FormioAddressResult): UnifiedAddress {
    const components: AddressComponent[] = [];

    // Extract components from Form.io address_components
    for (const component of result.address_components) {
      for (const type of component.types) {
        let addressType: ADDRESS_COMPONENT_TYPE | undefined;

        switch (type) {
          case 'street_number':
            addressType = ADDRESS_COMPONENT_TYPE.STREET_NUMBER;
            break;
          case 'route':
            addressType = ADDRESS_COMPONENT_TYPE.STREET;
            break;
          case 'locality':
            addressType = ADDRESS_COMPONENT_TYPE.LOCALITY;
            break;
          case 'administrative_area_level_1':
            addressType = ADDRESS_COMPONENT_TYPE.REGION;
            break;
          case 'postal_code':
            addressType = ADDRESS_COMPONENT_TYPE.POSTAL_CODE;
            break;
          case 'country':
            addressType = ADDRESS_COMPONENT_TYPE.COUNTRY;
            break;
        }

        if (addressType) {
          components.push({
            type: addressType,
            value: component.long_name,
          });
          break; // Only add first matching type
        }
      }
    }

    return {
      id: result.place_id,
      formatted_address: result.formatted_address,
      components,
      geometry: result.geometry.location,
      source: 'formio',
      metadata: {
        formio: result,
      },
    };
  }

  /**
   * Transforms UnifiedAddress to Form.io address result format
   *
   * @param address - Unified address
   * @returns Form.io compatible address result
   */
  static toFormio(address: UnifiedAddress): FormioAddressResult {
    const addressComponents = address.components.map((comp) => {
      let types: string[] = [];

      switch (comp.type) {
        case ADDRESS_COMPONENT_TYPE.STREET_NUMBER:
          types = ['street_number'];
          break;
        case ADDRESS_COMPONENT_TYPE.STREET:
          types = ['route'];
          break;
        case ADDRESS_COMPONENT_TYPE.LOCALITY:
          types = ['locality'];
          break;
        case ADDRESS_COMPONENT_TYPE.REGION:
          types = ['administrative_area_level_1'];
          break;
        case ADDRESS_COMPONENT_TYPE.POSTAL_CODE:
          types = ['postal_code'];
          break;
        case ADDRESS_COMPONENT_TYPE.COUNTRY:
          types = ['country'];
          break;
      }

      return {
        long_name: comp.value,
        short_name: comp.value,
        types,
      };
    });

    return {
      place_id: address.id,
      place_name: address.formatted_address,
      formatted_address: address.formatted_address,
      geometry: {
        location: address.geometry,
      },
      address_components: addressComponents,
      types: ['geocode'], // Default type for Form.io compatibility
    };
  }

  /**
   * Transforms UnifiedAddress to CalloutResponseAnswerAddress format
   *
   * @param address - Unified address
   * @returns Callout response address
   */
  static toCalloutResponse(
    address: UnifiedAddress
  ): CalloutResponseAnswerAddress {
    return {
      formatted_address: address.formatted_address,
      geometry: {
        location: address.geometry,
      },
    };
  }
}
