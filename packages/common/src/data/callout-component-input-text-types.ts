import type { CalloutComponentBaseInputTextSchema } from '../types/index.js';
import { CalloutComponentType } from './callout-component-type.js';

/** Array of all possible callout input component types */
export const calloutComponentInputTextTypes: Array<
  CalloutComponentBaseInputTextSchema['type']
> = [
  CalloutComponentType.INPUT_TEXT_AREA,
  CalloutComponentType.INPUT_TEXT_FIELD,
];
