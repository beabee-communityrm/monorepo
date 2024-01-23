import { CalloutInputType } from "../index.ts";
import type { BaseCalloutComponentSchema } from "./index.ts";

export interface InputCalloutComponentSchema
  extends BaseCalloutComponentSchema {
  type: CalloutInputType;
  input: true;
  placeholder?: string;
}
