import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputNumberRules,
} from "./index.ts";

export interface CalloutComponentInputNumberSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_NUMBER;
  /** Placeholder for the form */
  placeholder?: string;
  /** The validation rules for the form */
  validate?: CalloutComponentInputNumberRules;
}
