import type { CreateCalloutData, CreateCalloutVariantData } from './index.js';

export interface UpdateCalloutData
  extends Partial<Omit<CreateCalloutData, 'variants'>> {
  variants?: Partial<CreateCalloutVariantData>;
}
