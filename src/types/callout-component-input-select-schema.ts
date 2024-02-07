import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputSelectRules,
} from "./index.ts";

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
}
