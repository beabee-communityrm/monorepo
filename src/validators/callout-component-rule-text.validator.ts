import { isTextInRange, isTextInWordRange } from "../utils/index.ts";

import type { CalloutComponentInputTextRules } from "../types/index.ts";

export const calloutComponentRuleTextValidator = (
  rules: CalloutComponentInputTextRules | undefined,
  value: string,
): boolean => {
  if (!rules) {
    return true;
  }

  // Check if the value is required and not provided
  if (rules.required && !value?.length) {
    return false;
  }

  // Check if the value matches the provided pattern
  if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
    return false;
  }

  // Check word range if defined
  if (
    (typeof rules.maxWords === "number" ||
      typeof rules.minWords === "number") &&
    !isTextInWordRange(value, rules.minWords, rules.maxWords)
  ) {
    return false;
  }

  // Check length range if defined
  if (
    (typeof rules.maxLength === "number" ||
      typeof rules.minLength === "number") &&
    !isTextInRange(value, rules.minLength, rules.maxLength)
  ) {
    return false;
  }

  // If all checks pass, return true
  return true;
};
