import { BaseValidator } from "./base.validator.ts";

export class UrlValidator extends BaseValidator {
  // TODO: Add url validation settings
  constructor() {
    super();
  }

  validate(value: string): boolean {
    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlRegex.test(value);
  }
}
