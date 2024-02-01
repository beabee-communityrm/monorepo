import { calloutComponentNestableTypes } from "./callout-component-nestable-types.ts";
import { calloutComponentInputTypes } from "./callout-component-input-types.ts";
import { CalloutComponentType } from "./callout-component-type.ts";

/** Array of all possible callout component types */
export const calloutComponentTypes: CalloutComponentType[] = [
  ...calloutComponentNestableTypes,
  ...calloutComponentInputTypes,
  CalloutComponentType.CONTENT,
];
