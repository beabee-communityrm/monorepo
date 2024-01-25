import { BaseValidator } from "./base.validator.ts";
import type { RadioCalloutComponentSchema } from "../types/index.ts";

export class CalloutComponentRadioValidator extends BaseValidator {
  validate(_value: RadioCalloutComponentSchema): boolean {
    throw new Error(`[${this.constructor.name}] Not implemented yet`);
  }
}
