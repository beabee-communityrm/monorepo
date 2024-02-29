import { isPhoneNumber } from "../utils/index.ts";

import type {
  CalloutComponentInputPhoneNumberSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputPhoneNumberValidator:
  ValidatorCalloutComponent<CalloutComponentInputPhoneNumberSchema> = (
    _schema: CalloutComponentInputPhoneNumberSchema,
    answer: CalloutResponseAnswer | undefined,
  ): boolean => {
    return isPhoneNumber(answer);
  };
