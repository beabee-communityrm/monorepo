import type {
  CalloutComponentInputPhoneNumberSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from '../types/index.js';
import { isPhoneNumber } from '../utils/index.js';

export const calloutComponentInputPhoneNumberValidator: ValidatorCalloutComponent<
  CalloutComponentInputPhoneNumberSchema
> = (
  _schema: CalloutComponentInputPhoneNumberSchema,
  answer: CalloutResponseAnswer
): boolean => {
  return isPhoneNumber(answer);
};
