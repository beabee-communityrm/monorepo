import type { CalloutComponentBaseRules } from "./index.ts";

export interface CalloutComponentNumberRules extends CalloutComponentBaseRules {
  /** TODO: Add description and types */
  step?: "any" | string; // TODO: Add possible types
  /** TODO: Add description and types */
  integer?: "";
  /** The maximum value that can be entered for this field. */
  max?: number;
  /** The minimum value that can be entered for this field. */
  min?: number;
}
