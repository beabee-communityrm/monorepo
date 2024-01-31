import type {
  CalloutComponentBaseSchema,
  CalloutComponentSelectRules,
  CalloutComponentSelectType,
} from "./index.ts";

/** Dropdown menu component schema */
export interface CalloutComponentSelectSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentSelectType;
  input: true;
  data: {
    values: { label: string; value: string }[];
    /** Unused property */
    [key: string]: unknown;
  };
  validate?: CalloutComponentSelectRules;
}
