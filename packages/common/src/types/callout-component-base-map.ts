import type { CalloutComponentBaseType } from "../data/index.js";

import type {
  CalloutComponentContentSchema,
  CalloutComponentInputSchema,
  CalloutComponentInputSelectableSchema,
  CalloutComponentInputTextSchema,
  CalloutComponentNestableSchema
} from "./index.js";

type CalloutComponentBaseSchemas = {
  [CalloutComponentBaseType.CONTENT]: CalloutComponentContentSchema;

  [CalloutComponentBaseType.INPUT]: CalloutComponentInputSchema;
  [CalloutComponentBaseType.INPUT_TEXT]: CalloutComponentInputTextSchema;
  [CalloutComponentBaseType.INPUT_SELECTABLE]: CalloutComponentInputSelectableSchema;
  [CalloutComponentBaseType.NESTABLE]: CalloutComponentNestableSchema;
};

/**
 * Each key is a CalloutComponentBaseType and the value is the corresponding schema from CalloutComponentBaseSchemas
 */
export type CalloutComponentBaseMap = {
  [K in CalloutComponentBaseType]: CalloutComponentBaseSchemas[K];
};
