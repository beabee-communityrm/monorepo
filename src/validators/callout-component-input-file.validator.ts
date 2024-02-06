import { isCalloutComponentOfType, isURL } from "../utils/index.ts";
import { CalloutComponentType } from "../data/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputFileValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutComponentOfType(schema, CalloutComponentType.INPUT_URL)) {
    throw new Error("Schema is not a file component");
  }

  // If answer is not required and is undefined return true because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  // TODO: We just check the file URL at the moment, but we need to check the file size and type too

  return isURL(answer);
};
