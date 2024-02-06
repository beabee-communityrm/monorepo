import { isCalloutComponentOfType } from "../utils/index.ts";
import { CalloutComponentType } from "../data/index.ts";

import type { CalloutComponentSchema } from "../types/index.ts";

export const calloutComponentContentValidator = (
  schema: CalloutComponentSchema,
  answer: unknown,
): boolean => {
  if (!isCalloutComponentOfType(schema, CalloutComponentType.CONTENT)) {
    throw new Error("Schema is not a content component");
  }
  // Content components have no answer, so answer should be falsy
  return !answer;
};
