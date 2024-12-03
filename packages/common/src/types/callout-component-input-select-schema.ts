import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputSelectRules,
} from "./index.js";

/** Dropdown menu component schema */
export interface CalloutComponentInputSelectSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_SELECT;
  data: {
    values: { label: string; value: string }[];
    /** Unused property */
    [key: string]: unknown;
  };
  validate?: CalloutComponentInputSelectRules;
  /** The placeholder for the component */
  placeholder?: string;
}
