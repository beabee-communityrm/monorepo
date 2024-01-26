import type {
  BaseCalloutComponentSchema,
  CalloutComponentNestableType,
  CalloutComponentSchema,
} from "./index.ts";

export interface NestableCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutComponentNestableType;
  input: false;
  components: CalloutComponentSchema[];
}
