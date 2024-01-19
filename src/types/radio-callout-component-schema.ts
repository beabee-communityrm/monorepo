import type { BaseCalloutComponentSchema } from "./index.ts";

export interface RadioCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: "radio" | "selectboxes";
  input: true;
  values: { label: string; value: string; nextSlideId: string }[];
}
