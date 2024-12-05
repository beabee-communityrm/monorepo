import type { CalloutComponentType } from "../data/index.js";
import type { CalloutComponentBaseInputTextSchema } from "./index.js";

export interface CalloutComponentInputTextAreaSchema
  extends CalloutComponentBaseInputTextSchema {
  type: CalloutComponentType.INPUT_TEXT_AREA;
}
