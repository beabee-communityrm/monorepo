import type { CalloutComponentBaseRules } from "./index.ts";

export interface CalloutComponentNumberRules extends CalloutComponentBaseRules {
  /** TODO: Add description and types */
  step?: "any";
  /** TODO: Add description and types */
  integer?: "";
  /** The maximum number of values that can be entered for this field. */
  max?: number;
  /** The minimum number of values that can be entered for this field. */
  min?: number;
}
