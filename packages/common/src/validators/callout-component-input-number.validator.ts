import type {
  CalloutComponentInputNumberSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from '../types/index.js';
import { isNumber, isNumberInRange } from '../utils/index.js';

export const calloutComponentInputNumberValidator: ValidatorCalloutComponent<
  CalloutComponentInputNumberSchema
> = (
  schema: CalloutComponentInputNumberSchema,
  answer: CalloutResponseAnswer
): boolean => {
  if (
    schema.validate &&
    !isNumberInRange(answer, schema.validate.min, schema.validate.max)
  ) {
    return false;
  }

  return isNumber(answer);
};
