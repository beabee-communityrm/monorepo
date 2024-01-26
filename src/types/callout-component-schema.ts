import type {
  CalloutComponentContentSchema,
  CalloutComponentFileSchema,
  CalloutComponentInputSchema,
  CalloutComponentNestableSchema,
  CalloutComponentRadioSchema,
  CalloutComponentSelectSchema,
} from "./index.ts";

export type CalloutComponentSchema =
  | CalloutComponentSelectSchema
  | CalloutComponentRadioSchema
  | CalloutComponentInputSchema
  | CalloutComponentNestableSchema
  | CalloutComponentFileSchema
  | CalloutComponentContentSchema;
