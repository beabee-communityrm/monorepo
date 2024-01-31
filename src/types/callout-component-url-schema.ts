import type {
  CalloutComponentBaseSchema,
  CalloutComponentUrlRules,
  CalloutComponentUrlType,
} from "./index.ts";

export interface CalloutComponentUrlSchema extends CalloutComponentBaseSchema {
  type: CalloutComponentUrlType;
  /** This is always true for input forms */
  input: true;
  /** Placeholder for the form */
  placeholder?: string;
  /** If `true` multiple spaces will be truncated to a single space */
  truncateMultipleSpaces?: boolean;
  /** The validation rules for the form */
  validate?: CalloutComponentUrlRules;
}
