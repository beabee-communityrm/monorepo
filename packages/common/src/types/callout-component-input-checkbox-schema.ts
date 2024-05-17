import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputCheckboxRules,
} from "./index.ts";

export interface CalloutComponentInputCheckboxSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_CHECKBOX;

  /** Can not be set to true for checkboxes */
  multiple?: false;

  /** The default value for the checkbox */
  defaultValue?: boolean;

  /** The validation rules for the form */
  validate?: CalloutComponentInputCheckboxRules;
}
