import { BaseValidator } from "./base.validator.ts";

export class EmailValidator extends BaseValidator {
  // deno-lint-ignore no-explicit-any
  validate(value: any): boolean {
    if (typeof value !== "string" || value.length === 0) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}
