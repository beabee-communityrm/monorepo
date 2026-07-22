import { ADDRESS_COMPONENT_TYPE } from '@beabee/beabee-common';

import { config, geocoding } from '@maptiler/client';

import env from '../env';

config.apiKey = env.maptilerKey;

/**
 * Maps a MapTiler feature ID to a unified address component type. This method
 * assumes that the feature ID follows the format "type.id", where "type"
 * indicates the kind of geographic feature (e.g., "address", "postal_code",
 * "country", etc.). This is not explicitly documented in MapTiler's official
 * documentation but is inferred from observed data.
 *
 * @param id - The feature ID from MapTiler (e.g., "address.12345")
 * @returns The corresponding address component type or undefined
 */
function featureIdToType(id: string) {
  const [type] = id.split('.');
  switch (type) {
    case 'address':
      return ADDRESS_COMPONENT_TYPE.ADDRESS;
    case 'postal_code':
      return ADDRESS_COMPONENT_TYPE.POSTAL_CODE;
    case 'country':
      return ADDRESS_COMPONENT_TYPE.COUNTRY;
    case 'subregion':
      return ADDRESS_COMPONENT_TYPE.SUBREGION;
    case 'region':
      return ADDRESS_COMPONENT_TYPE.REGION;
    case 'locality':
      return ADDRESS_COMPONENT_TYPE.LOCALITY;
    case 'county':
      return ADDRESS_COMPONENT_TYPE.COUNTY;
    case 'joint_municipality':
      return ADDRESS_COMPONENT_TYPE.JOINT_MUNICIPALITY;
    case 'municipal_district':
      return ADDRESS_COMPONENT_TYPE.MUNICIPAL_DISTRICT;
    case 'neighbourhood':
      return ADDRESS_COMPONENT_TYPE.NEIGHBOURHOOD;
    case 'place':
      return ADDRESS_COMPONENT_TYPE.PLACE;
    case 'municipality':
      return ADDRESS_COMPONENT_TYPE.MUNICIPALITY;
    default:
      return undefined;
  }
}

export { geocoding, featureIdToType };
