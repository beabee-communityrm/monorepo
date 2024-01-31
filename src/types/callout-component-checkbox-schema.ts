import type {
  CalloutComponentBaseSchema,
  CalloutComponentCheckboxRules,
  CalloutComponentCheckboxType,
} from "./index.ts";

export interface CalloutComponentCheckboxSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentCheckboxType;
  /** This is always true for input forms */
  input: true;
  /** The validation rules for the form */
  validate?: CalloutComponentCheckboxRules;
}
