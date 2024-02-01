import {
  isCalloutInputTextComponent,
  isTextInRange,
  isTextInWordRange,
} from "../utils/index.ts";

import type {
  CalloutComponentInputTextRules,
  CalloutComponentSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

const validateRules = (
  rules: CalloutComponentInputTextRules | undefined,
  answer: string,
): boolean => {
  if (!rules) {
    return true;
  }

  // Check if the value is required and not provided
  if (rules.required && !answer) {
    return false;
  }

  // Check if the answer matches the provided pattern
  if (rules.pattern && !new RegExp(rules.pattern).test(answer)) {
    return false;
  }

  // Check word range if defined
  if (
    (typeof rules.maxWords === "number" ||
      typeof rules.minWords === "number") &&
    !isTextInWordRange(answer, rules.minWords, rules.maxWords)
  ) {
    return false;
  }

  // Check length range if defined
  if (
    (typeof rules.maxLength === "number" ||
      typeof rules.minLength === "number") &&
    !isTextInRange(answer, rules.minLength, rules.maxLength)
  ) {
    return false;
  }

  // If all checks pass, return true
  return true;
};

export const calloutComponentInputTextValidator = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputTextComponent(schema)) {
    throw new Error("Schema is not a text component");
  }

  if (typeof answer !== "string") {
    return false;
  }

  if (!validateRules(schema?.validate, answer)) {
    return false;
  }

  return true;
};
