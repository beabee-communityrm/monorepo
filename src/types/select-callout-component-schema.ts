import type { CalloutSelectType } from "../data/index.ts";
import type { BaseCalloutComponentSchema } from "./index.ts";

export interface SelectCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutSelectType;
  input: true;
  data: { values: { label: string; value: string }[] };
}
