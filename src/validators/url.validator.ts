import { BaseValidator } from "./base.validator.ts";
import { isURL } from "../utils/index.ts";

export class UrlValidator extends BaseValidator {
  // TODO: Add url validation settings
  constructor() {
    super();
  }

  validate(value: string): boolean {
    return isURL(value);
  }
}
