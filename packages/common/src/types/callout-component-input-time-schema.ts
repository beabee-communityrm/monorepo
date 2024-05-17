import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputTimeRules,
} from "./index.ts";

export interface CalloutComponentInputTimeSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_TIME;
  /** E.g. 99:99 */
  inputMask: string;
  /** The validation rules for the form */
  validate?: CalloutComponentInputTimeRules;
}
