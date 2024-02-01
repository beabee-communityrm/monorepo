import type {
  CalloutComponentContentSchema,
  CalloutComponentInputSchema,
  CalloutComponentNestableSchema,
} from "./index.ts";

/** Any callout component schema */
export type CalloutComponentSchema =
  | CalloutComponentNestableSchema
  | CalloutComponentContentSchema
  | CalloutComponentInputSchema;
