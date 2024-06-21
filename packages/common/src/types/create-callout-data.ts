import type {
  CalloutData,
  CalloutResponseViewSchema,
  CalloutVariantData,
  SetCalloutFormSchema,
} from "./index.ts";

export interface CreateCalloutData extends CalloutData {
  formSchema: SetCalloutFormSchema;
  variants: Record<string, CalloutVariantData>;
  responseViewSchema?: CalloutResponseViewSchema | null;
}
