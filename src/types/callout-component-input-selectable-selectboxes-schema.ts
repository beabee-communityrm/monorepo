import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSelectableSchema,
  CalloutComponentSelectboxesRules,
} from "./index.ts";

export interface CalloutComponentInputSelectableSelectboxesSchema
  extends CalloutComponentBaseInputSelectableSchema {
  type: CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES;
  validate?: CalloutComponentSelectboxesRules;
}
