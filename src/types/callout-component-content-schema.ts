import type { CalloutComponentType } from "../data/index.ts";
import type { CalloutComponentBaseSchema } from "./index.ts";

export interface CalloutComponentContentSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentType.CONTENT;
}
