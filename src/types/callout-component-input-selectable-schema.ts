import type {
  CalloutComponentInputSelectableRadioSchema,
  CalloutComponentInputSelectableSelectboxesSchema,
} from "./index.ts";

/** Any callout input selectable component schema */
export type CalloutComponentInputSelectableSchema =
  | CalloutComponentInputSelectableSelectboxesSchema
  | CalloutComponentInputSelectableRadioSchema;
