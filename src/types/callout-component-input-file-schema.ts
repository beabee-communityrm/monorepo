import type { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentInputFileRules,
} from "./index.ts";

export interface CalloutComponentInputFileSchema
  extends CalloutComponentBaseInputSchema {
  type: CalloutComponentType.INPUT_FILE;
  filePattern: string;
  validate?: CalloutComponentInputFileRules;
}
