import {
  isCalloutComponentOfBaseType,
  isTextInRange,
  isTextInWordRange,
} from "../utils/index.ts";
import { CalloutComponentBaseType } from "../data/index.ts";

import type {
  CalloutComponentInputTextRules,
  CalloutComponentSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

const validateRules = (
  rules: CalloutComponentInputTextRules | undefined,
  answer: string,
): boolean => {
  // Nothing to do..
  if (!rules) {
    return true;
  }

  // Check if the answer matches the provided pattern
  if (
    typeof rules.pattern === "string" && rules.pattern.length &&
    !new RegExp(rules.pattern).test(answer)
  ) {
    return false;
  }

  // Check word range if defined
  if (
    !isTextInWordRange(answer, rules.minWords, rules.maxWords)
  ) {
    return false;
  }

  // Check length range if defined
  if (
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
  if (
    !isCalloutComponentOfBaseType(schema, CalloutComponentBaseType.INPUT_TEXT)
  ) {
    throw new Error("Schema is not a text component");
  }

  // If answer is not required and is undefined return `true` because we don't need to validate this
  if (!schema.validate?.required && !answer) {
    return true;
  }

  if (typeof answer !== "string") {
    return false;
  }

  return validateRules(schema?.validate, answer);
};
