import type {
  BaseCalloutComponentSchema,
  CalloutComponentContentType,
} from "./index.ts";

export interface ContentCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutComponentContentType;
}
