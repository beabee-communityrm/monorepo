import type { CalloutComponentInputTextRules } from "../../../../../mod.ts";

export const calloutComponentValidateText1: CalloutComponentInputTextRules = {
  maxWords: 100,
  minWords: 1,
  required: true,
  maxLength: 1000,
  minLength: 10,
};
