import type { CalloutComponentBaseNestableSchema } from '../types/index.js';
import { CalloutComponentType } from './callout-component-type.js';

/** Array of all possible callout nestable component types */
export const calloutComponentNestableTypes: Array<
  CalloutComponentBaseNestableSchema['type']
> = [
  CalloutComponentType.NESTABLE_PANEL,
  CalloutComponentType.NESTABLE_WELL,
  CalloutComponentType.NESTABLE_TABS,
];
