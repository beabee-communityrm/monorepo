import type { CalloutComponentType } from "../data/index.ts";
import type { CalloutComponentBaseNestableSchema } from "./index.ts";

export interface CalloutComponentNestableWellSchema
  extends CalloutComponentBaseNestableSchema {
  type: CalloutComponentType.NESTABLE_WELL;
}
