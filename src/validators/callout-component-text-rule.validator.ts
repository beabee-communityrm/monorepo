import type { CalloutComponentTextValidationRules } from "../types/index.ts";

// TODO: Move this to a new CalloutComponentTextValidator?
export const calloutComponentTextRuleValidator = (
  rules: CalloutComponentTextValidationRules | undefined,
  value: string,
): boolean => {
  if (!rules) {
    return true;
  }

  // Check if the value is required and not provided
  if (rules.required && !value) {
    return false;
  }

  // Check if the value should be unique
  // if (rules.unique && !this.isUnique(value)) {
  //   return false;
  // }

  // Check if the value matches the provided pattern
  if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
    return false;
  }

  // Check if the value has the correct number of words
  const words = value.split(" ");
  if (rules.minWords && words.length < rules.minWords) {
    return false;
  }
  if (rules.maxWords && words.length > rules.maxWords) {
    return false;
  }

  // If all checks pass, return true
  return true;
};
