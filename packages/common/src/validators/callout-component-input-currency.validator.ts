import { isAmountOfMoney } from "../utils/index.js";

import type {
  CalloutComponentInputCurrencySchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent
} from "../types/index.js";

export const calloutComponentInputCurrencyValidator: ValidatorCalloutComponent<
  CalloutComponentInputCurrencySchema
> = (
  _schema: CalloutComponentInputCurrencySchema,
  answer: CalloutResponseAnswer
): boolean => {
  return isAmountOfMoney(answer);
};
