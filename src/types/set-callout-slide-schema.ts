import { CalloutComponentSchema, SetCalloutNavigationSchema } from "./index.ts";

export interface SetCalloutSlideSchema {
  id: string;
  title: string;
  components: CalloutComponentSchema[];
  navigation: SetCalloutNavigationSchema;
}
