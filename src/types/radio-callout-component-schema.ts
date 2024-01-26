import type {
  BaseCalloutComponentSchema,
  CalloutComponentRadioType,
} from "./index.ts";

export interface RadioCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutComponentRadioType;
  input: true;
  values: { label: string; value: string; nextSlideId: string }[];
}
