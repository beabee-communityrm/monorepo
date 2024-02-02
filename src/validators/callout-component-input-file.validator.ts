import { isCalloutInputFileComponent, isURL } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputFileValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputFileComponent(schema)) {
    throw new Error("Schema is not a file component");
  }

  // If is not required and answer is undefined return true because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  // TODO: We just check the file URL at the moment, but we need to check the file size and type too

  return isURL(answer);
};
