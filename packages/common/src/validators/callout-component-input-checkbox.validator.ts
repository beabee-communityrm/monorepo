import type {
  CalloutComponentInputCheckboxSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from '../types/index.js';

export const calloutComponentInputCheckboxValidator: ValidatorCalloutComponent<
  CalloutComponentInputCheckboxSchema
> = (
  _schema: CalloutComponentInputCheckboxSchema,
  answer: CalloutResponseAnswer
): boolean => {
  return typeof answer === 'boolean';
};
