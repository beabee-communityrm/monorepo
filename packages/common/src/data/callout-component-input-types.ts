import { CalloutComponentType } from './callout-component-type.js';
import { calloutComponentInputSelectableTypes } from './callout-component-input-selectable-types.js';
import { calloutComponentInputTextTypes } from './callout-component-input-text-types.js';

import type { CalloutComponentBaseInputSchema } from '../types/index.js';

/** Array of all possible callout input component types */
export const calloutComponentInputTypes: Array<
  CalloutComponentBaseInputSchema['type']
> = [
  ...calloutComponentInputSelectableTypes,
  ...calloutComponentInputTextTypes,
  CalloutComponentType.INPUT_ADDRESS,
  CalloutComponentType.INPUT_CHECKBOX,
  CalloutComponentType.INPUT_CURRENCY,
  CalloutComponentType.INPUT_DATE_TIME,
  CalloutComponentType.INPUT_EMAIL,
  CalloutComponentType.INPUT_FILE,
  CalloutComponentType.INPUT_NUMBER,
  CalloutComponentType.INPUT_PHONE_NUMBER,
  CalloutComponentType.INPUT_SELECT,
  CalloutComponentType.INPUT_SIGNATURE,
  CalloutComponentType.INPUT_TIME,
  CalloutComponentType.INPUT_URL,
];
