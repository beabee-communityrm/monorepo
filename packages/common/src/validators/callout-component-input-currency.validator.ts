import type {
  CalloutComponentInputCurrencySchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from '../types/index.js';
import { isAmountOfMoney } from '../utils/index.js';

export const calloutComponentInputCurrencyValidator: ValidatorCalloutComponent<
  CalloutComponentInputCurrencySchema
> = (
  _schema: CalloutComponentInputCurrencySchema,
  answer: CalloutResponseAnswer
): boolean => {
  return isAmountOfMoney(answer);
};
