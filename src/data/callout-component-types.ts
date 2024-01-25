import {
  CalloutContentType,
  CalloutFileType,
  CalloutInputType,
  CalloutNestableType,
  CalloutRadioType,
  CalloutSelectType,
} from "./index.ts";

import type { CalloutComponentType } from "../types/index.ts";

/** Array of all possible component types */
export const calloutComponentTypes: CalloutComponentType[] = [
  ...Object.values(CalloutFileType),
  ...Object.values(CalloutInputType),
  ...Object.values(CalloutNestableType),
  ...Object.values(CalloutRadioType),
  ...Object.values(CalloutContentType),
  ...Object.values(CalloutSelectType),
];
