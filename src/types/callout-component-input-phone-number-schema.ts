import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputPhoneNumberRules,
} from "./index.ts";

export interface CalloutComponentInputPhoneNumberSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_PHONE_NUMBER;
  /** The validation rules for the form */
  validate?: CalloutComponentInputPhoneNumberRules;
  /** The placeholder for the component */
  placeholder?: string;
}
