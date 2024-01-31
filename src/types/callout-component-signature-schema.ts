import type {
  CalloutComponentBaseSchema,
  CalloutComponentSignatureRules,
  CalloutComponentSignatureType,
} from "./index.ts";

export interface CalloutComponentSignatureSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentSignatureType;
  /** This is always true for input forms */
  input: true;
  /** The validation rules for the form */
  validate?: CalloutComponentSignatureRules;
}
