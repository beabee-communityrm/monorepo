import { isNumber, isNumberInRange } from "../utils/index.ts";

import type {
  CalloutComponentInputNumberSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputNumberValidator: ValidatorCalloutComponent<
  CalloutComponentInputNumberSchema
> = (
  schema: CalloutComponentInputNumberSchema,
  answer: CalloutResponseAnswer,
): boolean => {
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
