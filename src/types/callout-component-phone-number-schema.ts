import type {
  CalloutComponentBaseSchema,
  CalloutComponentPhoneNumberRules,
  CalloutComponentPhoneNumberType,
} from "./index.ts";

export interface CalloutComponentPhoneNumberSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentPhoneNumberType;
  /** This is always true for input forms */
  input: true;
  /** The validation rules for the form */
  validate?: CalloutComponentPhoneNumberRules;
}
