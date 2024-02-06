import { isDateBetween } from "../utils/index.ts";

import type {
  CalloutComponentInputDateTimeSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputDateTimeValidator: ValidatorCalloutComponent<
  CalloutComponentInputDateTimeSchema
> = (
  schema: CalloutComponentInputDateTimeSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!schema.validate?.required && !answer) {
    return true;
  }

  if (typeof answer !== "string") {
    return false;
  }

  return isDateBetween(answer, schema.widget.minDate, schema.widget.maxDate);
};
