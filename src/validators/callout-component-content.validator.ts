import { BaseValidator } from "./base.validator.ts";
import type { CalloutComponentContentSchema } from "../types/index.ts";

export class CalloutComponentContentValidator extends BaseValidator {
  validate(_value: CalloutComponentContentSchema): boolean {
    throw new Error(`[${this.constructor.name}] Not implemented yet`);
  }
}
