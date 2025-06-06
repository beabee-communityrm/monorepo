import type { CalloutComponentType } from '../data/index.js';
import type {
  CalloutComponentBaseInputSelectableSchema,
  CalloutComponentSelectboxesRules,
} from './index.js';

export interface CalloutComponentInputSelectableSelectboxesSchema
  extends CalloutComponentBaseInputSelectableSchema {
  type: CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES;
  validate?: CalloutComponentSelectboxesRules;
}
