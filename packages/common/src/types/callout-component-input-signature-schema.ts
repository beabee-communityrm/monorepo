import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputSignatureRules,
} from "./index.ts";

export interface CalloutComponentInputSignatureSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_SIGNATURE;
  /** The validation rules for the form */
  validate?: CalloutComponentInputSignatureRules;
}
