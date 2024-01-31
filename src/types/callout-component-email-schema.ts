import type {
  CalloutComponentBaseSchema,
  CalloutComponentEmailRules,
  CalloutComponentEmailType,
  TextCase,
} from "./index.ts";

export interface CalloutComponentEmailSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentEmailType;
  /** This is always true for input forms */
  input: true;
  /** Placeholder for the form */
  placeholder?: string;
  /** The text case for the form */
  case?: TextCase;
  /** The validation rules for the form */
  validate?: CalloutComponentEmailRules;
}
