import { SetCalloutNavigationSchema } from '../index.js';

export interface GetCalloutNavigationSchema extends SetCalloutNavigationSchema {
  prevText: string;
  nextText: string;
  submitText: string;
}
