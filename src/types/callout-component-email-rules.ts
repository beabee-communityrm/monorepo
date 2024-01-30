import type { CalloutComponentBaseRules } from "./index.ts";

export interface CalloutComponentEmailRules extends CalloutComponentBaseRules {
  /** The regular expression pattern test that the field value must pass before the form can be submitted. */
  pattern?: string;
  /** The minimum amount of words that can be added to this field. */
  maxLength?: number;
  /** The minimum length requirement this field must meet. */
  minLength?: number;
}
