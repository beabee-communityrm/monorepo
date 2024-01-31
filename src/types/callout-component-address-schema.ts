import type {
  CalloutComponentAddressRules,
  CalloutComponentAddressType,
  CalloutComponentBaseSchema,
} from "./index.ts";

export interface CalloutComponentAddressSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentAddressType;
  /** This is always true for input forms */
  input: true;
  /** The validation rules for the form */
  validate?: CalloutComponentAddressRules;
}
