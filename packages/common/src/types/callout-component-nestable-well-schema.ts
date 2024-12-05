import type { CalloutComponentType } from "../data/index.js";
import type { CalloutComponentBaseNestableSchema } from "./index.js";

export interface CalloutComponentNestableWellSchema
  extends CalloutComponentBaseNestableSchema {
  type: CalloutComponentType.NESTABLE_WELL;
}
