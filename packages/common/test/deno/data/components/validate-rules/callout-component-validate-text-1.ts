import type { CalloutComponentInputTextRules } from "../../../../../mod.ts";

export const calloutComponentValidateText1: CalloutComponentInputTextRules = {
  minWords: 0,
  maxWords: 10000,
  required: false,
  maxLength: 10000,
  minLength: 0,
};
