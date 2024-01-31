import type {
  CalloutComponentBaseSchema,
  CalloutComponentSelectableRules,
  CalloutComponentSelectType,
} from "./index.ts";

export interface CalloutComponentSelectSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentSelectType;
  input: true;
  data: {
    url?: string;
    json?: string;
    custom?: string;
    resource?: string;
    values: { label: string; value: string }[];
  };
  validate?: CalloutComponentSelectableRules;
}
