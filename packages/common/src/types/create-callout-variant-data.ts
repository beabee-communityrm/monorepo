import type { CalloutVariantData } from './callout-variant-data.js';

export interface CreateCalloutVariantData {
  default: CalloutVariantData;
  [key: string]: CalloutVariantData;
}
