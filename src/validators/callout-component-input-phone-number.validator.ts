import {
  isCalloutInputPhoneNumberComponent,
  isPhoneNumber,
} from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputPhoneNumberValidator:
  ValidatorCalloutComponent = (
    schema: CalloutComponentSchema,
    answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputPhoneNumberComponent(schema)) {
      throw new Error("Schema is not a phone number component");
    }

    return isPhoneNumber(answer);
  };
