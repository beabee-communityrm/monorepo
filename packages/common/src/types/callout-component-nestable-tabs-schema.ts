import type { CalloutComponentType } from "../data/index.js";
import type { CalloutComponentBaseNestableSchema } from "./index.js";

export interface CalloutComponentNestableTabsSchema
  extends CalloutComponentBaseNestableSchema {
  type: CalloutComponentType.NESTABLE_TABS;
}
