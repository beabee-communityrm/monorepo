import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentBaseRules,
} from "./index.ts";

export interface CalloutComponentBaseInputSelectableSchema
  extends CalloutComponentBaseInputSchema {
  type:
    | CalloutComponentType.INPUT_SELECTABLE_RADIO
    | CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES;
  values: { label: string; value: string; nextSlideId?: string }[];
  validate?: CalloutComponentBaseRules;
}
