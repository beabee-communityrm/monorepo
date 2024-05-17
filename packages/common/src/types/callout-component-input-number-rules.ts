import type { CalloutComponentBaseRules } from "./index.ts";

export interface CalloutComponentInputNumberRules
  extends CalloutComponentBaseRules {
  /** TODO: For what is this property? */
  integer?: "";
  /** The maximum value that can be entered for this field. */
  max?: number;
  /** The minimum value that can be entered for this field. */
  min?: number;
}
