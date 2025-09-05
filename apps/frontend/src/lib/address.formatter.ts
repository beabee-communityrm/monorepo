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
   * Supports placeholder replacement like: "{address} {street_number}, {postal_code} {municipality|county|region}"
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
      return '';
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
    const locality = context.find((ctx) => ctx.id.startsWith('locality'));
    const subregion = context.find((ctx) => ctx.id.startsWith('subregion'));
    const county = context.find((ctx) => ctx.id.startsWith('county'));
    const jointMunicipality = context.find((ctx) =>
      ctx.id.startsWith('joint_municipality')
    );
    const municipalDistrict = context.find((ctx) =>
      ctx.id.startsWith('municipal_district')
    );
    const neighbourhood = context.find((ctx) =>
      ctx.id.startsWith('neighbourhood')
    );
    const place = context.find((ctx) => ctx.id.startsWith('place'));
    const municipality = context.find((ctx) =>
      ctx.id.startsWith('municipality')
    );
    const postalCode = context.find((ctx) => ctx.id.startsWith('postal_code'));

    // Build components array
    if (feature.address) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.STREET_NUMBER,
        value: feature.address,
      });
    }

    if (feature.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.ADDRESS,
        value: feature.text,
      });
    }

    if (locality?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.LOCALITY,
        value: locality.text,
      });
    }

    if (municipality?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.MUNICIPALITY,
        value: municipality.text,
      });
    }

    if (region?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.REGION,
        value: region.text,
      });
    }

    if (subregion?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.SUBREGION,
        value: subregion.text,
      });
    }

    if (county?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.COUNTY,
        value: county.text,
      });
    }

    if (jointMunicipality?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.JOINT_MUNICIPALITY,
        value: jointMunicipality.text,
      });
    }

    if (municipalDistrict?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.MUNICIPAL_DISTRICT,
        value: municipalDistrict.text,
      });
    }

    if (neighbourhood?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.NEIGHBOURHOOD,
        value: neighbourhood.text,
      });
    }

    if (place?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.PLACE,
        value: place.text,
      });
    }

    if (postalCode?.text) {
      components.push({
        type: ADDRESS_COMPONENT_TYPE.POSTAL_CODE,
        value: postalCode.text,
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
      const type: ADDRESS_COMPONENT_TYPE = Object.values(
        ADDRESS_COMPONENT_TYPE
      ).find((type) => type === component.types[0]) as ADDRESS_COMPONENT_TYPE;
      if (type) {
        components.push({
          type,
          value: component.long_name,
        });
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
      return {
        long_name: comp.value,
        short_name: comp.value,
        types: [comp.type],
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
