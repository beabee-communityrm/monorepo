import type {
  CalloutComponentBaseSchema,
  CalloutComponentInputType,
  CalloutComponentValidationRules,
} from "./index.ts";

export interface CalloutComponentInputSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentInputType;
  input: true;
  validate?: CalloutComponentValidationRules;
  placeholder?: string;
}
