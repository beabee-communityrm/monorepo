import type { SelectCalloutComponentSchema, RadioCalloutComponentSchema, InputCalloutComponentSchema, NestableCalloutComponentSchema } from "./index.ts";

export type CalloutComponentSchema =
  | SelectCalloutComponentSchema
  | RadioCalloutComponentSchema
  | InputCalloutComponentSchema
  | NestableCalloutComponentSchema;
