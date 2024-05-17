import type { GetCalloutFormSchema } from '@beabee/beabee-common';

export interface GetCalloutFormData {
  formSchema: GetCalloutFormSchema;
  intro: string;
  thanksText: string;
  thanksTitle: string;
  thanksRedirect?: string;
  shareTitle?: string;
  shareDescription?: string;
}
