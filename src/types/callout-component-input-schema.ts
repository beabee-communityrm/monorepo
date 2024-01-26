import type {
  CalloutComponentBaseSchema,
  CalloutComponentInputType,
} from "./index.ts";

export interface CalloutComponentInputSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentInputType;
  input: true;
  placeholder?: string;
}
