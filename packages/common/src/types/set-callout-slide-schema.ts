import {
  type CalloutComponentSchema,
  type SetCalloutNavigationSchema,
} from './index.js';

export interface SetCalloutSlideSchema {
  id: string;
  title: string;
  components: CalloutComponentSchema[];
  navigation: SetCalloutNavigationSchema;
}
