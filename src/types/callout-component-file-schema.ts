import type {
  CalloutComponentBaseSchema,
  CalloutComponentFileType,
} from "./index.ts";

export interface CalloutComponentFileSchema extends CalloutComponentBaseSchema {
  type: CalloutComponentFileType;
  input: true;
  filePattern: string;
}
