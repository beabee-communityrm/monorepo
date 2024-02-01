import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputCheckboxRules,
} from "./index.ts";

export interface CalloutComponentInputCheckboxSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_CHECKBOX;
  /** The validation rules for the form */
  validate?: CalloutComponentInputCheckboxRules;
}
