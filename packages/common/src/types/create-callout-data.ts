import type {
  CalloutData,
  CalloutVariantData,
  SetCalloutFormSchema,
} from "./index.js";

export interface CreateCalloutData extends CalloutData {
  formSchema: SetCalloutFormSchema;
  variants: Record<string, CalloutVariantData>;
}
