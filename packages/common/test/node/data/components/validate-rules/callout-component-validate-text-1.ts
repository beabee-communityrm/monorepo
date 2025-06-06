import type { CalloutComponentInputTextRules } from '@beabee/beabee-common';

export const calloutComponentValidateText1: CalloutComponentInputTextRules = {
  minWords: 0,
  maxWords: 10000,
  required: false,
  maxLength: 10000,
  minLength: 0,
};
