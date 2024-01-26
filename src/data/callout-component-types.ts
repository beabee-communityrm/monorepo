import {
  calloutComponentContentTypes,
  calloutComponentFileTypes,
  calloutComponentInputTypes,
  calloutComponentNestableTypes,
  calloutComponentRadioTypes,
  calloutComponentSelectTypes,
} from "./index.ts";

import type { CalloutComponentType } from "../types/index.ts";

/** Array of all possible component types */
export const calloutComponentTypes: CalloutComponentType[] = [
  ...calloutComponentFileTypes,
  ...calloutComponentInputTypes,
  ...calloutComponentNestableTypes,
  ...calloutComponentRadioTypes,
  ...calloutComponentContentTypes,
  ...calloutComponentSelectTypes,
];
