import { isCalloutInputUrlComponent, isURL } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputUrlValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputUrlComponent(schema)) {
    throw new Error("Schema is not a url component");
  }

  // If answer is not required and is undefined return `true` because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  return isURL(answer);
};
