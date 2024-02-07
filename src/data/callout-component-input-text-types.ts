import { CalloutComponentType } from "./callout-component-type.ts";

import type { CalloutComponentBaseInputTextSchema } from "../types/index.ts";

/** Array of all possible callout input component types */
export const calloutComponentInputTextTypes: Array<
  CalloutComponentBaseInputTextSchema["type"]
> = [
  CalloutComponentType.INPUT_TEXT_AREA,
  CalloutComponentType.INPUT_TEXT_FIELD,
];
