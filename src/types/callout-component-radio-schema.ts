import type {
  CalloutComponentBaseSchema,
  CalloutComponentRadioType,
  CalloutComponentSelectRules,
} from "./index.ts";

export interface CalloutComponentRadioSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentRadioType;
  input: true;
  values: { label: string; value: string; nextSlideId: string }[];
  validate?: CalloutComponentSelectRules;
}
