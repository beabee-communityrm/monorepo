import type {
  CalloutComponentBaseSchema,
  CalloutComponentNumberRules,
  CalloutComponentNumberType,
} from "./index.ts";

export interface CalloutComponentNumberSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentNumberType;
  /** This is always true for input forms */
  input: true;
  /** Placeholder for the form */
  placeholder?: string;
  /** The validation rules for the form */
  validate?: CalloutComponentNumberRules;
}
