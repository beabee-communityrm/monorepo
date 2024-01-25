import { CalloutContentType } from "../index.ts";
import type { BaseCalloutComponentSchema } from "./index.ts";

export interface ContentCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutContentType;
}
