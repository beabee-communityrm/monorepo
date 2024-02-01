import { isCalloutInputDateTimeComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputDateTimeValidator: ValidatorCalloutComponent =
  (
    schema: CalloutComponentSchema,
    _answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputDateTimeComponent(schema)) {
      throw new Error("Schema is not a date-time component");
    }
    throw new Error(
      `[calloutComponentInputDateTimeValidator] Not implemented yet`,
    );
  };
