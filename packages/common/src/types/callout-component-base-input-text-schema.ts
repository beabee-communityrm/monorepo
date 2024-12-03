import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputTextRules,
  TextCase
} from "./index.js";

/** The schema for input text forms */
export interface CalloutComponentBaseInputTextSchema
  extends CalloutComponentBaseInputSchema {
  type:
    | CalloutComponentType.INPUT_TEXT_FIELD
    | CalloutComponentType.INPUT_TEXT_AREA;
  /** Placeholder for the form */
  placeholder?: string;
  /** The text case for the form */
  case?: TextCase;
  /** The validation rules for the form */
  validate?: CalloutComponentInputTextRules;
}
