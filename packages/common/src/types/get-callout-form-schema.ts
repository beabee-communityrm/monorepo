import type { GetCalloutSlideSchema, SetCalloutFormSchema } from './index.js';

export interface GetCalloutFormSchema extends SetCalloutFormSchema {
  slides: GetCalloutSlideSchema[];
  componentText: Record<string, string>;
}
