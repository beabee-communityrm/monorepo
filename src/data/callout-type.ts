import {
  CalloutFileType,
  CalloutInputType,
  CalloutNestableType,
  CalloutRadioType,
} from "./index.ts";

export const calloutType = [
  ...Object.values(CalloutFileType),
  ...Object.values(CalloutInputType),
  ...Object.values(CalloutNestableType),
  ...Object.values(CalloutRadioType),
];
