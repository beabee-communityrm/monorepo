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
    throw new Error("Schema is not a file component");
  }

  if (!isURL(answer)) {
    return false;
  }

  return true;
};
