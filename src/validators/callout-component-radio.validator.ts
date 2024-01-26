import { BaseValidator } from "./base.validator.ts";
import type { CalloutComponentRadioSchema } from "../types/index.ts";

export class CalloutComponentRadioValidator extends BaseValidator {
  validate(_value: CalloutComponentRadioSchema): boolean {
    throw new Error(`[${this.constructor.name}] Not implemented yet`);
  }
}
