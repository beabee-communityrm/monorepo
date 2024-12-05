import { calloutComponentNestableTypes } from "./callout-component-nestable-types.js";
import { calloutComponentInputTypes } from "./callout-component-input-types.js";
import { CalloutComponentType } from "./callout-component-type.js";

/** Array of all possible callout component types */
export const calloutComponentTypes: CalloutComponentType[] = [
  ...calloutComponentNestableTypes,
  ...calloutComponentInputTypes,
  CalloutComponentType.CONTENT
];
