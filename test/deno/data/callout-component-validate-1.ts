import type { CalloutComponentTextValidationRules } from "../../../mod.ts";

export const calloutComponentValidate1: CalloutComponentTextValidationRules = {
  json: "",
  custom: "",
  unique: false,
  pattern: "",
  maxWords: 100,
  minWords: 1,
  multiple: false,
  required: true,
  maxLength: 1000,
  minLength: 10,
  customMessage: "You didn't follow the rules",
  customPrivate: false,
  strictDateValidation: false,
};
