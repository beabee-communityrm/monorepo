import type { CalloutComponentType } from "../data/index.ts";
import type { CalloutComponentBaseNestableSchema } from "./index.ts";

export interface CalloutComponentNestableTabsSchema
  extends CalloutComponentBaseNestableSchema {
  type: CalloutComponentType.NESTABLE_TABS;
}
