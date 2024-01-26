import { BaseValidator } from "./base.validator.ts";
import { isEmail } from "../utils/index.ts";

export class EmailValidator extends BaseValidator {
  validate(value: unknown): boolean {
    return isEmail(value);
  }
}
