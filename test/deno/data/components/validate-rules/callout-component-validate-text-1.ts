import type { CalloutComponentTextRules } from "../../../../../mod.ts";

export const calloutComponentValidateText1: CalloutComponentTextRules = {
  maxWords: 100,
  minWords: 1,
  required: true,
  maxLength: 1000,
  minLength: 10,
};
