import type { CalloutComponentType } from '../data/index.js';
import type {
  CalloutComponentBaseInputSelectableSchema,
  CalloutComponentInputSelectableRadioRules,
} from './index.js';

export interface CalloutComponentInputSelectableRadioSchema
  extends CalloutComponentBaseInputSelectableSchema {
  type: CalloutComponentType.INPUT_SELECTABLE_RADIO;
  validate?: CalloutComponentInputSelectableRadioRules;
}
