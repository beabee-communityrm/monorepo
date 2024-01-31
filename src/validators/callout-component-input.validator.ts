import { isEmail, isNumber, isURL, toPhoneNumber } from "../utils/index.ts";
import { calloutComponentRuleTextValidator } from "./callout-component-rule-text.validator.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCallout,
} from "../types/index.ts";

// TODO: Split validators
export const calloutComponentInputValidator: ValidatorCallout = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  switch (schema.type) {
    case "email":
      return isEmail(answer);
    case "url":
      return isURL(answer);
    case "phoneNumber":
      return !!toPhoneNumber(answer);
    case "textarea":
    case "textfield":
      return typeof answer === "string" &&
        calloutComponentRuleTextValidator(schema.validate, answer);
    case "number":
      return isNumber(answer);
    // case "datetime":
    //   return new DateValidator().validate(answer);
    // case "time":
    //   return new TimeValidator().validate(answer);
    // case "address":
    //   return new AddressValidator().validate(answer);
    // case "checkbox":
    //   return new CheckboxValidator().validate(answer);
    default:
      throw new Error(
        `[calloutComponentInputValidator] Unsupported type: ${schema.type}`,
      );
  }
};
