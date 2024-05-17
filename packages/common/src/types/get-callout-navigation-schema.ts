import { SetCalloutNavigationSchema } from "../index.ts";

export interface GetCalloutNavigationSchema extends SetCalloutNavigationSchema {
  prevText: string;
  nextText: string;
  submitText: string;
}
