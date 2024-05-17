import type { CalloutComponentBaseRules } from "./index.ts";

export interface CalloutComponentInputUrlRules
  extends CalloutComponentBaseRules {
  /** The regular expression pattern test that the field value must pass before the form can be submitted. */
  pattern?: string;
  /** The maximum length requirement this field must meet */
  maxLength?: number;
  /** The minimum length requirement this field must meet. */
  minLength?: number;
}
