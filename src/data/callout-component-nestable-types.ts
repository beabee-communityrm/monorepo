import { CalloutComponentType } from "./callout-component-type.ts";

import type { CalloutComponentBaseNestableSchema } from "../types/index.ts";

/** Array of all possible callout nestable component types */
export const calloutComponentNestableTypes: Array<
  CalloutComponentBaseNestableSchema["type"]
> = [
  CalloutComponentType.NESTABLE_PANEL,
  CalloutComponentType.NESTABLE_WELL,
  CalloutComponentType.NESTABLE_TABS,
];
