import type { CalloutComponentInputType } from "../types/index.ts";

/** Array of all possible callout input component types */
export const calloutComponentInputTypes: CalloutComponentInputType[] = [
  "address",
  "button",
  "checkbox",
  "email",
  "number",
  "password",
  "textfield",
  "textarea",
  "phoneNumber",
  "currency",
  "datetime",
  "time",
  "url",
  "signature", // TODO: Create custom component type for this
];
