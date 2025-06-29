import type {
  CalloutComponentInputSelectableRadioSchema,
  CalloutComponentInputSelectableSelectboxesSchema,
} from './index.js';

/** Any callout input selectable component schema */
export type CalloutComponentInputSelectableSchema =
  | CalloutComponentInputSelectableSelectboxesSchema
  | CalloutComponentInputSelectableRadioSchema;
