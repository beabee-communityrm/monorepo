import { BaseValidator } from "./base.validator.ts";
import type { SelectCalloutComponentSchema } from "../types/index.ts";

export class CalloutComponentSelectValidator extends BaseValidator {
  validate(value: SelectCalloutComponentSchema): boolean {
    throw new Error(`[${this.constructor.name}] Not implemented yet`);
    return false;
  }
}
