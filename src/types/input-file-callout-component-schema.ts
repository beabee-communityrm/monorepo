import type { InputCalloutComponentSchema } from "./index.ts";

export interface InputFileCalloutComponentSchema
  extends InputCalloutComponentSchema {
  type: "file";
  filePattern: string;
}
