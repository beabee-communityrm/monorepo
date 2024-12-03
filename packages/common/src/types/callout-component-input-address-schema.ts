import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputAddressRules
} from "./index.js";

export interface CalloutComponentInputAddressSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_ADDRESS;
  /** The validation rules for the form */
  validate?: CalloutComponentInputAddressRules;
  /** Placeholder for the form */
  placeholder?: string;
}
