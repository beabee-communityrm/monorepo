import type { GetCalloutSlideSchema, SetCalloutFormSchema } from "./index.ts";

export interface GetCalloutFormSchema extends SetCalloutFormSchema {
  slides: GetCalloutSlideSchema[];
  componentText: Record<string, string>;
}
