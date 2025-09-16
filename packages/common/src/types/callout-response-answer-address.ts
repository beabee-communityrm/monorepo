import { ADDRESS_COMPONENT_TYPE } from '../constants';

export interface CalloutResponseAnswerAddressComponent {
  type: ADDRESS_COMPONENT_TYPE;
  value: string;
}

export interface CalloutResponseAnswerAddress {
  id: string;
  formatted_address: string;
  components: CalloutResponseAnswerAddressComponent[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  source: 'maptiler';
}
