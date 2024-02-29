import { isAmountOfMoney } from "../utils/index.ts";

import type {
  CalloutComponentInputCurrencySchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputCurrencyValidator: ValidatorCalloutComponent<
  CalloutComponentInputCurrencySchema
> = (
  _schema: CalloutComponentInputCurrencySchema,
  answer: CalloutResponseAnswer | undefined,
): boolean => {
  return isAmountOfMoney(answer);
};
