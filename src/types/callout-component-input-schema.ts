import type {
  CalloutComponentBaseSchema,
  CalloutComponentInputType,
  CalloutComponentTextValidationRules,
} from "./index.ts";

export interface CalloutComponentInputSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentInputType;
  input: true;
  validate?: CalloutComponentTextValidationRules; // TODO: Other types for other input types?
  placeholder?: string;
}
