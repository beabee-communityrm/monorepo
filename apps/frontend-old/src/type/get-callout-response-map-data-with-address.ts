import type {
  CalloutResponseAnswerAddress,
  GetCalloutResponseMapData,
} from '@beabee/beabee-common';

export type GetCalloutResponseMapDataWithAddress = GetCalloutResponseMapData & {
  address: CalloutResponseAnswerAddress;
};
