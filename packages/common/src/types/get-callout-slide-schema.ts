import { GetCalloutNavigationSchema, SetCalloutSlideSchema } from '../index.js';

export interface GetCalloutSlideSchema extends SetCalloutSlideSchema {
  navigation: GetCalloutNavigationSchema;
}
