import { CalloutComponentType } from "./callout-component-type.ts";
import { calloutComponentInputSelectableTypes } from "./callout-component-input-selectable-types.ts";
import { calloutComponentInputTextTypes } from "./callout-component-input-text-types.ts";

import type { CalloutComponentBaseInputSchema } from "../types/index.ts";

/** Array of all possible callout input component types */
export const calloutComponentInputTypes: Array<
  CalloutComponentBaseInputSchema["type"]
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
