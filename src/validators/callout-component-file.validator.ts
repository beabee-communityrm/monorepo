import { isCalloutInputFileComponent, isURL } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutInput,
} from "../types/index.ts";

export const calloutComponentFileValidator: ValidatorCalloutInput = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputFileComponent(schema)) {
    throw new Error("Schema is not a file component");
  }

  if (!isURL(answer)) {
    return false;
  }

  // TODO: Validate file size and file pattern / type

  return true;
};
