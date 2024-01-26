import type {
  BaseCalloutComponentSchema,
  CalloutComponentSelectType,
} from "./index.ts";

export interface SelectCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutComponentSelectType;
  input: true;
  data: {
    url?: string;
    json?: string;
    custom?: string;
    resource?: string;
    values: { label: string; value: string }[];
  };
}
