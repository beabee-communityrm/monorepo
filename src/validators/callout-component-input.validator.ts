import {
  isCalloutInputComponent,
  isEmail,
  isNumber,
  isURL,
  toPhoneNumber,
} from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

// TODO: Split validators
export const calloutComponentInputValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputComponent(schema)) {
    throw new Error(
      `[calloutComponentNestableValidator] schema is not a input component`,
    );
  }

  switch (schema.type) {
    case "email":
      return isEmail(answer);
    case "url":
      return isURL(answer);
    case "phoneNumber":
      return toPhoneNumber(answer) !== false;
    case "number":
      return isNumber(answer);
    default:
      throw new Error(
        `[calloutComponentInputValidator] Unsupported type: ${schema.type}`,
      );
  }
};
