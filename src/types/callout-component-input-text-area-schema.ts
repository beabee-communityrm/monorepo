import type { CalloutComponentType } from "../data/index.ts";
import type { CalloutComponentBaseInputTextSchema } from "./index.ts";

export interface CalloutComponentInputTextAreaSchema
  extends CalloutComponentBaseInputTextSchema {
  type: CalloutComponentType.INPUT_TEXT_AREA;
}
