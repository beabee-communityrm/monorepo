import type { CalloutRadioType } from "../data/index.ts";
import type { BaseCalloutComponentSchema } from "./index.ts";

export interface RadioCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutRadioType;
  input: true;
  values: { label: string; value: string; nextSlideId: string }[];
}
