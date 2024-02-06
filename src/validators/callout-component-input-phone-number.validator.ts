import { isPhoneNumber } from "../utils/index.ts";

import type {
  CalloutComponentInputPhoneNumberSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputPhoneNumberValidator:
  ValidatorCalloutComponent<CalloutComponentInputPhoneNumberSchema> = (
    schema: CalloutComponentInputPhoneNumberSchema,
    answer: CalloutResponseAnswer,
  ): boolean => {
    // If answer is not required and is undefined return `true` because we don't need to validate this
    if (!schema.validate?.required && answer === undefined) {
      return true;
    }

    return isPhoneNumber(answer);
  };
