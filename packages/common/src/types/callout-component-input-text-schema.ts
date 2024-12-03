import type {
  CalloutComponentInputTextAreaSchema,
  CalloutComponentInputTextFieldSchema,
} from "./index.js";

/** Any callout input text component schema */
export type CalloutComponentInputTextSchema =
  | CalloutComponentInputTextAreaSchema
  | CalloutComponentInputTextFieldSchema;
