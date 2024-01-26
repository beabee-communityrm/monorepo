import type {
  BaseCalloutComponentSchema,
  CalloutComponentInputType,
} from "./index.ts";

export interface InputCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutComponentInputType;
  input: true;
  placeholder?: string;
}
