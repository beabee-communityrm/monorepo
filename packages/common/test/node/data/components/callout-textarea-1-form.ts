import {
  CalloutComponentType,
  type CalloutComponentInputTextAreaSchema,
} from '@beabee/beabee-common';
import { calloutComponentValidateText1 } from './validate-rules/callout-component-validate-text-1.js';

export const calloutTextarea1Form: CalloutComponentInputTextAreaSchema = {
  id: 'ei5n40f',
  key: 'howDoYouFeel',
  rows: 3,
  type: CalloutComponentType.INPUT_TEXT_AREA,
  input: true,
  label: 'How did you get interested in software development?',
  validate: calloutComponentValidateText1,
  inputMask: '',
  inputType: 'text',
  displayMask: '',
  inputFormat: 'html',
  placeholder: 'I get interested in software developmen, because...',
};
