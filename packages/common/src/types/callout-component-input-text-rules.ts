import type { CalloutComponentBaseRules } from "./index.ts";

export interface CalloutComponentInputTextRules
  extends CalloutComponentBaseRules {
  /** The regular expression pattern test that the field value must pass before the form can be submitted. */
  pattern?: string;
  /** The maximum amount of words that can be added to this field. */
  maxWords?: number;
  /** The minimum amount of words that can be added to this field. */
  minWords?: number;
  /** The maximum length requirement this field must meet */
  maxLength?: number;
  /** The minimum length requirement this field must meet. */
  minLength?: number;
}
