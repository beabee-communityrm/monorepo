import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputAddressRules,
} from "./index.ts";

export interface CalloutComponentInputAddressSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_ADDRESS;
  /** The validation rules for the form */
  validate?: CalloutComponentInputAddressRules;
}
