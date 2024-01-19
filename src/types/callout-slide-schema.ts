import type {
  CalloutComponentSchema,
  CalloutNavigationSchema,
} from "./index.ts";

export interface CalloutSlideSchema {
  id: string;
  title: string;
  components: CalloutComponentSchema[];
  navigation: CalloutNavigationSchema;
}
