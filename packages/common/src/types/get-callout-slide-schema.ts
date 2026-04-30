import {
  type GetCalloutNavigationSchema,
  type SetCalloutSlideSchema,
} from '../index.js';

export interface GetCalloutSlideSchema extends SetCalloutSlideSchema {
  navigation: GetCalloutNavigationSchema;
}
