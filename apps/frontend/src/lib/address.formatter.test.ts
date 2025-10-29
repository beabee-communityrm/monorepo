import {
  ADDRESS_COMPONENT_TYPE,
  type CalloutResponseAnswerAddress,
} from '@beabee/beabee-common';

import { describe, expect, it } from 'vitest';

import { AddressFormatter } from './address.formatter';
import {
  CERN,
  GERMANY_15936,
  NASA,
  STONEHENGE,
} from './address.formatter.test-data';

describe('AddressFormatter.format', () => {
  it('should format address with basic pattern', () => {
    const address: CalloutResponseAnswerAddress = {
      id: 'test-id',
      formatted_address: 'Test Address',
      components: [
        { type: ADDRESS_COMPONENT_TYPE.ADDRESS, value: 'Hauptstraße' },
        { type: ADDRESS_COMPONENT_TYPE.POSTAL_CODE, value: '10115' },
        { type: ADDRESS_COMPONENT_TYPE.MUNICIPALITY, value: 'Berlin' },
      ],
      geometry: { location: { lat: 52.52, lng: 13.405 } },
      source: 'maptiler',
    };

    const result = AddressFormatter.format(
      address,
      '{address}, {postal_code} {municipality}'
    );
    expect(result).toBe('Hauptstraße, 10115 Berlin');
  });

  it('should handle fallback patterns with | separator', () => {
    const address: CalloutResponseAnswerAddress = {
      id: 'test-id',
      formatted_address: 'Test Address',
      components: [
        { type: ADDRESS_COMPONENT_TYPE.MUNICIPALITY, value: 'Berlin' },
        { type: ADDRESS_COMPONENT_TYPE.REGION, value: 'Berlin' },
      ],
      geometry: { location: { lat: 52.52, lng: 13.405 } },
      source: 'maptiler',
    };

    // municipality exists, so it uses that
    const result1 = AddressFormatter.format(address, '{municipality|region}');
    expect(result1).toBe('Berlin');

    // Test with missing municipality - should fallback to region
    const addressWithoutMunicipality: CalloutResponseAnswerAddress = {
      ...address,
      components: [{ type: ADDRESS_COMPONENT_TYPE.REGION, value: 'Berlin' }],
    };
    const result2 = AddressFormatter.format(
      addressWithoutMunicipality,
      '{municipality|region}'
    );
    expect(result2).toBe('Berlin');
  });

  it('should return empty string for missing components', () => {
    const address: CalloutResponseAnswerAddress = {
      id: 'test-id',
      formatted_address: 'Test Address',
      components: [],
      geometry: { location: { lat: 52.52, lng: 13.405 } },
      source: 'maptiler',
    };

    const result = AddressFormatter.format(address, '{address}, {postal_code}');
    expect(result).toBe(', ');
  });

  describe('with real MapTiler data', () => {
    it('should format CERN address correctly', () => {
      const cernAddress = AddressFormatter.fromMapTiler(CERN.features[0]);

      // Test different formatting patterns
      expect(
        AddressFormatter.format(cernAddress, '{address}, {municipality}')
      ).toBe('CERN SITE DE MEYRIN, Meyrin');
      expect(
        AddressFormatter.format(cernAddress, '{municipality}, {region}')
      ).toBe('Meyrin, Geneva');
      expect(
        AddressFormatter.format(
          cernAddress,
          '{municipality}, {region}, {country}'
        )
      ).toBe('Meyrin, Geneva, Switzerland');
      expect(
        AddressFormatter.format(cernAddress, '{postal_code} {municipality}')
      ).toBe('1217 Meyrin');
    });

    it('should format NASA address correctly', () => {
      const nasaAddress = AddressFormatter.fromMapTiler(NASA.features[0]);

      expect(AddressFormatter.format(nasaAddress, '{address}, {place}')).toBe(
        'NASA Parkway West, Merritt Island'
      );
      expect(
        AddressFormatter.format(nasaAddress, '{place}, {county}, {region}')
      ).toBe('Merritt Island, Brevard, Florida');
      expect(
        AddressFormatter.format(nasaAddress, '{county}, {region}, {country}')
      ).toBe('Brevard, Florida, United States');
      expect(AddressFormatter.format(nasaAddress, '{postal_code}')).toBe(
        '32953'
      );
    });

    it('should format Stonehenge address correctly', () => {
      const stonehengeAddress = AddressFormatter.fromMapTiler(
        STONEHENGE.features[0]
      );

      expect(
        AddressFormatter.format(stonehengeAddress, '{address}, {municipality}')
      ).toBe('Byway 12, Amesbury');
      expect(
        AddressFormatter.format(
          stonehengeAddress,
          '{municipality}, {county}, {region}'
        )
      ).toBe('Amesbury, Wiltshire, England');
      expect(
        AddressFormatter.format(
          stonehengeAddress,
          '{county}, {region}, {country}'
        )
      ).toBe('Wiltshire, England, United Kingdom');
      expect(AddressFormatter.format(stonehengeAddress, '{postal_code}')).toBe(
        'SP4 7DE'
      );
    });

    it('should handle fallback patterns with real data', () => {
      const cernAddress = AddressFormatter.fromMapTiler(CERN.features[0]);

      // Test fallback: municipality exists, so it should use that
      const result1 = AddressFormatter.format(
        cernAddress,
        '{municipality|region}'
      );
      expect(result1).toBe('Meyrin');

      // Test with address that has region but no municipality
      const regionOnlyAddress: CalloutResponseAnswerAddress = {
        ...cernAddress,
        components: cernAddress.components.filter(
          (comp) => comp.type !== ADDRESS_COMPONENT_TYPE.MUNICIPALITY
        ),
      };
      const result2 = AddressFormatter.format(
        regionOnlyAddress,
        '{municipality|region}'
      );
      expect(result2).toBe('Geneva');
    });

    it('should format addresses with street numbers', () => {
      const cernAddress = AddressFormatter.fromMapTiler(CERN.features[0]);
      const nasaAddress = AddressFormatter.fromMapTiler(NASA.features[0]);

      // CERN has street number 33
      expect(
        AddressFormatter.format(cernAddress, '{street_number} {address}')
      ).toBe('33 CERN SITE DE MEYRIN');

      // NASA has street number 3535
      expect(
        AddressFormatter.format(nasaAddress, '{street_number} {address}')
      ).toBe('3535 NASA Parkway West');
    });

    it('should handle complex address patterns', () => {
      const nasaAddress = AddressFormatter.fromMapTiler(NASA.features[0]);

      const complexPattern =
        '{street_number} {address}, {place}, {county} {postal_code}, {region}, {country}';
      const result = AddressFormatter.format(nasaAddress, complexPattern);
      expect(result).toBe(
        '3535 NASA Parkway West, Merritt Island, Brevard 32953, Florida, United States'
      );
    });

    it('should handle missing components gracefully', () => {
      const minimalAddress: CalloutResponseAnswerAddress = {
        id: 'minimal',
        formatted_address: 'Test',
        components: [
          { type: ADDRESS_COMPONENT_TYPE.MUNICIPALITY, value: 'Berlin' },
        ],
        geometry: { location: { lat: 52.52, lng: 13.405 } },
        source: 'maptiler',
      };

      const result = AddressFormatter.format(
        minimalAddress,
        '{address}, {municipality}, {postal_code}'
      );
      expect(result).toBe(', Berlin, ');
    });
  });
});

describe('AddressFormatter.fromMapTiler', () => {
  it('should convert CERN MapTiler feature to CalloutResponseAnswerAddress', () => {
    const cernAddress = AddressFormatter.fromMapTiler(CERN.features[0]);

    expect(cernAddress.formatted_address).toBe(
      'CERN SITE DE MEYRIN 33, 1217 Meyrin, Switzerland'
    );

    // Check components
    const components = cernAddress.components;
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.STREET_NUMBER)
        ?.value
    ).toBe('33');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.ADDRESS)?.value
    ).toBe('CERN SITE DE MEYRIN');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.POSTAL_CODE)
        ?.value
    ).toBe('1217');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.MUNICIPALITY)
        ?.value
    ).toBe('Meyrin');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.REGION)?.value
    ).toBe('Geneva');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.COUNTRY)?.value
    ).toBe('Switzerland');
  });

  it('should convert NASA MapTiler feature to CalloutResponseAnswerAddress', () => {
    const nasaAddress = AddressFormatter.fromMapTiler(NASA.features[0]);

    expect(nasaAddress.id).toBe('address.23742203');
    expect(nasaAddress.formatted_address).toBe(
      '3535 NASA Parkway West, Brevard, Florida 32953, United States'
    );

    const components = nasaAddress.components;
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.STREET_NUMBER)
        ?.value
    ).toBe('3535');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.ADDRESS)?.value
    ).toBe('NASA Parkway West');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.PLACE)?.value
    ).toBe('Merritt Island');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.COUNTY)?.value
    ).toBe('Brevard');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.REGION)?.value
    ).toBe('Florida');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.COUNTRY)?.value
    ).toBe('United States');
  });

  it('should convert Stonehenge MapTiler feature to CalloutResponseAnswerAddress', () => {
    const stonehengeAddress = AddressFormatter.fromMapTiler(
      STONEHENGE.features[0]
    );

    expect(stonehengeAddress.id).toBe('address.3780158');
    expect(stonehengeAddress.formatted_address).toBe(
      'Byway 12, Amesbury, Wiltshire SP4 7DE, United Kingdom'
    );

    const components = stonehengeAddress.components;
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.ADDRESS)?.value
    ).toBe('Byway 12');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.POSTAL_CODE)
        ?.value
    ).toBe('SP4 7DE');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.MUNICIPALITY)
        ?.value
    ).toBe('Amesbury');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.COUNTY)?.value
    ).toBe('Wiltshire');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.REGION)?.value
    ).toBe('England');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.COUNTRY)?.value
    ).toBe('United Kingdom');
  });

  it('should convert address with no street feature', () => {
    const postCodeOnlyFeature = AddressFormatter.fromMapTiler(
      GERMANY_15936.features[0]
    );

    expect(postCodeOnlyFeature.formatted_address).toBe('15936, Deutschland');

    const components = postCodeOnlyFeature.components;
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.ADDRESS)?.value
    ).toBeUndefined();
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.POSTAL_CODE)
        ?.value
    ).toBe('15936');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.MUNICIPALITY)
        ?.value
    ).toBe('Dahme/Mark');
    expect(
      components.find((c) => c.type === ADDRESS_COMPONENT_TYPE.COUNTRY)?.value
    ).toBe('Deutschland');
  });
});
