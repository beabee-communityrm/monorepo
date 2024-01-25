import { BaseValidator } from "./base.validator.ts";
import type { ContentCalloutComponentSchema } from "../types/index.ts";

export class CalloutComponentContentValidator extends BaseValidator {
  validate(value: ContentCalloutComponentSchema): boolean {
    throw new Error(`[${this.constructor.name}] Not implemented yet`);
    return false;
  }
}
