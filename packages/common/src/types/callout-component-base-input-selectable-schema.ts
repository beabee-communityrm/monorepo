import type { CalloutComponentType } from "../data/index.js";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentBaseRules
} from "./index.js";

export interface CalloutComponentBaseInputSelectableSchema
  extends CalloutComponentBaseInputSchema {
  type:
    | CalloutComponentType.INPUT_SELECTABLE_RADIO
    | CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES;
  values: { label: string; value: string; nextSlideId?: string }[];
  validate?: CalloutComponentBaseRules;
}
