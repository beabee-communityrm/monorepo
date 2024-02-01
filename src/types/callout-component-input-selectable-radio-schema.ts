import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSelectableSchema,
  CalloutComponentInputSelectableRadioRules,
} from "./index.ts";

export interface CalloutComponentInputSelectableRadioSchema
  extends CalloutComponentBaseInputSelectableSchema {
  type: CalloutComponentType.INPUT_SELECTABLE_RADIO;
  validate?: CalloutComponentInputSelectableRadioRules;
}
