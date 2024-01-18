import type { BaseCalloutComponentSchema } from "./index.ts";

export interface SelectCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: "select";
  input: true;
  data: { values: { label: string; value: string }[] };
}
