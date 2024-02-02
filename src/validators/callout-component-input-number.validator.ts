import { isCalloutInputUrlComponent, isNumber } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputNumberValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputUrlComponent(schema)) {
    throw new Error("Schema is not a number component");
  }

  return isNumber(answer);
};
