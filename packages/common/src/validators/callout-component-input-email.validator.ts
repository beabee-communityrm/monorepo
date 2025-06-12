import type {
  CalloutComponentInputEmailSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from '../types/index.js';
import { isEmail } from '../utils/index.js';

export const calloutComponentInputEmailValidator: ValidatorCalloutComponent<
  CalloutComponentInputEmailSchema
> = (
  _schema: CalloutComponentInputEmailSchema,
  answer: CalloutResponseAnswer
): boolean => {
  return isEmail(answer);
};
