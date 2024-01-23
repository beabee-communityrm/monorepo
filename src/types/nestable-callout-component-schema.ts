import type { CalloutNestableType } from "../data/index.ts";
import type {
  BaseCalloutComponentSchema,
  CalloutComponentSchema,
} from "./index.ts";

export interface NestableCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutNestableType;
  input: false;
  components: CalloutComponentSchema[];
}
