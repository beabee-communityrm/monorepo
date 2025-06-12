import type {
  CalloutComponentInputDateTimeSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from '../types/index.js';
import { isDateBetween } from '../utils/index.js';

export const calloutComponentInputDateTimeValidator: ValidatorCalloutComponent<
  CalloutComponentInputDateTimeSchema
> = (
  schema: CalloutComponentInputDateTimeSchema,
  answer: CalloutResponseAnswer
): boolean => {
  if (typeof answer !== 'string') {
    return false;
  }

  return isDateBetween(answer, schema.widget.minDate, schema.widget.maxDate);
};
