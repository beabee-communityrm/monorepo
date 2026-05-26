import {
  ADDRESS_COMPONENT_TYPE,
  type CalloutResponseAnswerAddress,
  type CalloutResponseAnswerAddressComponent,
} from '@beabee/beabee-common';

import type { GeocodingFeature } from '@maptiler/client';

import { featureIdToType } from './maptiler';

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
   * Supports placeholder replacement like: "{address} {street_number}, {postal_code} {municipality|county|region}"
   *
   * @param address - Unified address to format
   * @param pattern - Pattern string with placeholders
   * @returns Formatted address string
   */
  static format(
    address: CalloutResponseAnswerAddress,
    pattern: string
  ): string {
    return pattern.replace(/{([\w|]+)}/g, (_match, keys) => {
      for (const key of keys.split('|')) {
        const component = address.components.find((comp) => comp.type === key);
        if (component?.value) {
          return component.value;
        }
      }
      return '';
    });
  }

  /**
   * Transforms MapTiler GeocodingFeature to CalloutResponseAnswerAddress
   *
   * @param feature - MapTiler geocoding feature
   * @returns Unified address
   */
  static fromMapTiler(feature: GeocodingFeature): CalloutResponseAnswerAddress {
    const components: CalloutResponseAnswerAddressComponent[] = [
      feature,
      ...(feature.context || []),
    ]
      .map((component) => {
        const type = featureIdToType(component.id);
        return type && { type, value: component.text };
      })
      .filter((c) => !!c);

    if (feature.address) {
      // Components are usually more specific to less specific, so street
      // number should go first
      components.unshift({
        type: ADDRESS_COMPONENT_TYPE.STREET_NUMBER,
        value: feature.address,
      });
    }

    return {
      id: feature.id,
      formatted_address: feature.place_name,
      components,
      geometry: {
        location: {
          lat: feature.center[1],
          lng: feature.center[0],
        },
      },
      source: 'maptiler',
    };
  }
}
