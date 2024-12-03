import type {
  CalloutComponentContentSchema,
  CalloutComponentInputSchema,
  CalloutComponentNestableSchema
} from "./index.js";

/** Any callout component schema */
export type CalloutComponentSchema =
  | CalloutComponentNestableSchema
  | CalloutComponentContentSchema
  | CalloutComponentInputSchema;
