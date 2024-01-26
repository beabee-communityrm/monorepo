import type {
  BaseCalloutComponentSchema,
  CalloutComponentFileType,
} from "./index.ts";

export interface FileCalloutComponentSchema extends BaseCalloutComponentSchema {
  type: CalloutComponentFileType;
  input: true;
  filePattern: string;
}
