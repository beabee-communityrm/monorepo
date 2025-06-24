import type {
  CalloutData,
  CreateCalloutVariantData,
  SetCalloutFormSchema,
} from './index.js';

export interface CreateCalloutData extends CalloutData {
  formSchema: SetCalloutFormSchema;
  variants: CreateCalloutVariantData;
}
