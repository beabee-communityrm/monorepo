import type {
  ContentCalloutComponentSchema,
  FileCalloutComponentSchema,
  InputCalloutComponentSchema,
  NestableCalloutComponentSchema,
  RadioCalloutComponentSchema,
  SelectCalloutComponentSchema,
} from "./index.ts";

export type CalloutComponentSchema =
  | SelectCalloutComponentSchema
  | RadioCalloutComponentSchema
  | InputCalloutComponentSchema
  | NestableCalloutComponentSchema
  | FileCalloutComponentSchema
  | ContentCalloutComponentSchema;
