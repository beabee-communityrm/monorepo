import type {
  CalloutComponentBaseSchema,
  CalloutComponentNestableType,
  CalloutComponentSchema,
} from "./index.ts";

export interface CalloutComponentNestableSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentNestableType;
  input: false;
  components: CalloutComponentSchema[];
}
