import {
  isCalloutInputDateTimeComponent,
  isDateBetween,
} from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputDateTimeValidator: ValidatorCalloutComponent =
  (
    schema: CalloutComponentSchema,
    answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputDateTimeComponent(schema)) {
      throw new Error("Schema is not a date-time component");
    }

    if (!schema.validate?.required && !answer) {
      return true;
    }

    if (typeof answer !== "string") {
      return false;
    }

    return isDateBetween(answer, schema.widget.minDate, schema.widget.maxDate);
  };
