import type { CalloutVariantData } from './callout-variant-data';

export interface CreateCalloutVariantData {
  default: CalloutVariantData;
  [key: string]: CalloutVariantData;
}
