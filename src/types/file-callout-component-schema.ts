import type { CalloutFileType } from "../data/index.ts";
import type { BaseCalloutComponentSchema } from "./index.ts";

export interface FileCalloutComponentSchema extends BaseCalloutComponentSchema {
  type: CalloutFileType;
  input: true;
  filePattern: string;
}
