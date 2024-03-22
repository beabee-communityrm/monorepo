import { GetCalloutNavigationSchema, SetCalloutSlideSchema } from "../index.ts";

export interface GetCalloutSlideSchema extends SetCalloutSlideSchema {
  navigation: GetCalloutNavigationSchema;
}
