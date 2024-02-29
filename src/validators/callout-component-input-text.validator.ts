import { isTextInRange, isTextInWordRange } from "../utils/index.ts";

import type {
  CalloutComponentInputTextRules,
  CalloutComponentInputTextSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

const validateRules = (
  rules: CalloutComponentInputTextRules | undefined,
  answer: string | undefined,
): boolean => {
  // Nothing to do..
  if (!rules) {
    return true;
  }

  if (!answer && rules.required) {
    return false;
  }

  // Check if the answer matches the provided pattern
  if (
    typeof rules.pattern === "string" && rules.pattern.length &&
    !new RegExp(rules.pattern).test(answer || "")
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

export const calloutComponentInputTextValidator: ValidatorCalloutComponent<
  CalloutComponentInputTextSchema
> = (
  schema: CalloutComponentInputTextSchema,
  answer: CalloutResponseAnswer | undefined,
): boolean => {
  if (typeof answer !== "string") {
    return false;
  }

  return validateRules(schema?.validate, answer);
};
