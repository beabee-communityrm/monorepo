import type {
  CalloutComponentBaseSchema,
  CalloutComponentEmailRules,
  CalloutComponentInputType,
  CalloutComponentNumberRules,
  CalloutComponentTextRules,
} from "./index.ts";

export interface CalloutComponentInputSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentInputType;
  input: true;
  validate?:
    & CalloutComponentTextRules
    & CalloutComponentEmailRules
    & CalloutComponentNumberRules; // TODO: Split to multiple schemas like `CalloutComponentEmailSchema`?
  placeholder?: string;
}
