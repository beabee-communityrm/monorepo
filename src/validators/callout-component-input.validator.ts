import { BaseCalloutValidator, EmailValidator, UrlValidator } from "./index.ts";
import type {
  CalloutComponentInputSchema,
  CalloutComponentValidationRules,
  CalloutResponseAnswer,
} from "../types/index.ts";

export class CalloutComponentInputValidator extends BaseCalloutValidator {
  /**
   * Check if the callout component answer is unique
   * @param value
   * @returns
   */
  isUnique(_value: unknown): boolean {
    // Not implemented yet
    return true;
  }

  // TODO: Move this to a new CalloutComponentTextValidator?
  validateWithRules(
    rules: CalloutComponentValidationRules,
    value: string,
  ): boolean {
    // Check if the value is required and not provided
    if (rules.required && !value) {
      return false;
    }

    // Check if the value should be unique
    if (rules.unique && !this.isUnique(value)) {
      return false;
    }

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
  }

  validate(
    schema: CalloutComponentInputSchema,
    answer: CalloutResponseAnswer,
  ): boolean {
    const answers = Array.isArray(answer) ? answer : [answer];

    for (const answer of answers) {
      switch (schema.type) {
        case "email":
          return new EmailValidator().validate(answer);
        case "url":
          return new UrlValidator().validate(answer);
        // case "phoneNumber":
        //   return new PhoneValidator().validate(answer);
        // case "textarea":
        // case "textfield":
        //   return new TextValidator().validate(answer);
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
        // case "password":
        //   return new PasswordValidator().validate(answer);
        default:
          throw new Error(
            `[${this.constructor.name}] Unsupported type: ${schema.type}`,
          );
      }
    }

    console.error(new Error(`[${this.constructor.name}] Not implemented yet`));
    return false;
  }
}
