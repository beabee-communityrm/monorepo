import {
  isEmail,
  isInputComponent,
  isPassword,
  isURL,
} from "../utils/index.ts";
import { calloutComponentRuleTextValidator } from "./callout-component-text-rule.validator.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCallout,
} from "../types/index.ts";

export const calloutComponentInputValidator: ValidatorCallout = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isInputComponent(schema)) {
    throw new Error("Schema is not a input component");
  }

  switch (schema.type) {
    case "email":
      return isEmail(answer);
    case "url":
      return isURL(answer);
    // case "phoneNumber":
    //   return new PhoneValidator().validate(answer);
    case "textarea":
    case "textfield":
      return typeof answer === "string" &&
        calloutComponentRuleTextValidator(schema.validate, answer);
    // case "number":
    //   return new NumberValidator().validate(answer);
    // case "datetime":
    //   return new DateValidator().validate(answer);
    // case "time":
    //   return new TimeValidator().validate(answer);
    // case "address":
    //   return new AddressValidator().validate(answer);
    // case "checkbox":
    //   return new CheckboxValidator().validate(answer);
    case "password":
      return isPassword(answer);
    default:
      throw new Error(
        `[calloutComponentInputValidator] Unsupported type: ${schema.type}`,
      );
  }
};
