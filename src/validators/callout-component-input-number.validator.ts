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
  answer: CalloutResponseAnswer | undefined,
): boolean => {
  if (
    schema.validate &&
    !isNumberInRange(answer, schema.validate.min, schema.validate.max)
  ) {
    return false;
  }

  return isNumber(answer);
};
