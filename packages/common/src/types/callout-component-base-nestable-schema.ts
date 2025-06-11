import type { CalloutComponentType } from '../data/index.js';
import type {
  CalloutComponentBaseSchema,
  CalloutComponentSchema,
} from './index.js';

export interface CalloutComponentBaseNestableSchema
  extends CalloutComponentBaseSchema {
  type:
    | CalloutComponentType.NESTABLE_TABS
    | CalloutComponentType.NESTABLE_PANEL
    | CalloutComponentType.NESTABLE_WELL;
  input: false;
  components: CalloutComponentSchema[];
}
