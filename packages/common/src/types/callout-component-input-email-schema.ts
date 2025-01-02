import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputEmailRules,
  TextCase
} from "./index.js";

export interface CalloutComponentInputEmailSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_EMAIL;
  /** Placeholder for the form */
  placeholder?: string;
  /** The text case for the form */
  case?: TextCase;
  /** The validation rules for the form */
  validate?: CalloutComponentInputEmailRules;
}
