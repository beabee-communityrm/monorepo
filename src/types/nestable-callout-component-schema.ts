import type {
  BaseCalloutComponentSchema,
  CalloutComponentSchema,
} from "./index.ts";

export interface NestableCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: "panel" | "well" | "tabs";
  input: false;
  components: CalloutComponentSchema[];
}
