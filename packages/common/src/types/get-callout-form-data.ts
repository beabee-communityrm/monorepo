import type { GetCalloutFormSchema } from "./index.ts";

export interface GetCalloutFormData {
  formSchema: GetCalloutFormSchema;
  intro: string;
  thanksText: string;
  thanksTitle: string;
  thanksRedirect?: string;
  shareTitle?: string;
  shareDescription?: string;
}
