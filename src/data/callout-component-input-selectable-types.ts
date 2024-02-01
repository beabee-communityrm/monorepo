import { CalloutComponentType } from "./callout-component-type.ts";

import type { CalloutComponentBaseInputSelectableSchema } from "../types/index.ts";

/** Array of all possible callout nestable component types */
export const calloutComponentInputSelectableTypes: Array<
  CalloutComponentBaseInputSelectableSchema["type"]
> = [
  CalloutComponentType.INPUT_SELECTABLE_RADIO,
  CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES,
];
