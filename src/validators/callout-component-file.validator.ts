import { isFileComponent, isURL } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCallout,
} from "../types/index.ts";

export const calloutComponentFileValidator: ValidatorCallout = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isFileComponent(schema)) {
    throw new Error("Schema is not a file component");
  }

  if (!isURL(answer)) {
    return false;
  }

  // TODO: Validate file size and file pattern / type

  return true;
};
