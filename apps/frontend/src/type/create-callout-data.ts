import type { SetCalloutFormSchema } from '@beabee/beabee-common';

import type {
  CalloutData,
  CalloutResponseViewSchema,
  CalloutVariantData,
} from '@type';

export interface CreateCalloutData extends CalloutData {
  formSchema: SetCalloutFormSchema;
  variants: Record<string, CalloutVariantData>;
  responseViewSchema: CalloutResponseViewSchema | null;
}
