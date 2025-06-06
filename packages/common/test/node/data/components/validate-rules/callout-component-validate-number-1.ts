import type { CalloutComponentInputNumberRules } from '@beabee/beabee-common';

export const calloutComponentValidateNumber1: CalloutComponentInputNumberRules =
  {
    max: 100,
    min: 0,
    step: 'any',
    integer: '',
    required: false,
  };
