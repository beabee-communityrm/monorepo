import type {
  CalloutComponentInputTextAreaSchema,
  CalloutComponentInputTextFieldSchema,
} from "./index.ts";

/** Any callout input text component schema */
export type CalloutComponentInputTextSchema =
  | CalloutComponentInputTextAreaSchema
  | CalloutComponentInputTextFieldSchema;
