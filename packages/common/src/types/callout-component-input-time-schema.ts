import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputTimeRules
} from "./index.js";

export interface CalloutComponentInputTimeSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_TIME;
  /** E.g. 99:99 */
  inputMask: string;
  /** The validation rules for the form */
  validate?: CalloutComponentInputTimeRules;
}
