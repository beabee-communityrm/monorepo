import { isAmountOfMoney } from "../utils/index.ts";

import type {
  CalloutComponentInputCurrencySchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputCurrencyValidator: ValidatorCalloutComponent<
  CalloutComponentInputCurrencySchema
> = (
  schema: CalloutComponentInputCurrencySchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (schema.validate?.required && answer === undefined) {
    return true;
  }

  return isAmountOfMoney(answer);
};
