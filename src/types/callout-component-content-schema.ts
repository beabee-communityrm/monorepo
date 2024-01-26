import type {
  CalloutComponentBaseSchema,
  CalloutComponentContentType,
} from "./index.ts";

export interface CalloutComponentContentSchema
  extends CalloutComponentBaseSchema {
  type: CalloutComponentContentType;
}
