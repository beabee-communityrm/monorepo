import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputUrlRules,
} from "./index.ts";

export interface CalloutComponentInputUrlSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_URL;
  /** Placeholder for the form */
  placeholder?: string;
  /** If `true` multiple spaces will be truncated to a single space */
  truncateMultipleSpaces?: boolean;
  /** The validation rules for the form */
  validate?: CalloutComponentInputUrlRules;
}
