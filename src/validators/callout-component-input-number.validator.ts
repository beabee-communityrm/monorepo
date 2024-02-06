import {
  isCalloutComponentOfType,
  isNumber,
  isNumberInRange,
} from "../utils/index.ts";
import { CalloutComponentType } from "../data/index.ts";

import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputNumberValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutComponentOfType(schema, CalloutComponentType.INPUT_NUMBER)) {
    throw new Error("Schema is not a number component");
  }

  // If answer is not required and is undefined return true because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  if (
    schema.validate &&
    !isNumberInRange(answer, schema.validate.min, schema.validate.max)
  ) {
    return false;
  }

  return isNumber(answer);
};
