import type {
  CalloutComponentBaseSchema,
  CalloutComponentTextRules,
  CalloutComponentTextType,
  TextCase,
} from "./index.ts";

export interface CalloutComponentTextSchema extends CalloutComponentBaseSchema {
  type: CalloutComponentTextType;
  /** This is always true for input forms */
  input: true;
  /** Placeholder for the form */
  placeholder?: string;
  /** The text case for the form */
  case?: TextCase;
  /** The validation rules for the form */
  validate?: CalloutComponentTextRules;
}
