import { isCalloutComponentOfType, isURL } from "../utils/index.ts";
import { CalloutComponentType } from "../data/index.ts";

import type {
  CalloutComponentInputUrlSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputUrlValidator: ValidatorCalloutComponent<
  CalloutComponentInputUrlSchema
> = (
  schema: CalloutComponentInputUrlSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutComponentOfType(schema, CalloutComponentType.INPUT_URL)) {
    throw new Error("Schema is not a url component");
  }

  // If answer is not required and is undefined return `true` because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  return isURL(answer);
};
