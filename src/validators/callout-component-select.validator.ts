import { BaseValidator } from "./base.validator.ts";
import type { CalloutComponentSelectSchema } from "../types/index.ts";

export class CalloutComponentSelectValidator extends BaseValidator {
  validate(_value: CalloutComponentSelectSchema): boolean {
    throw new Error(`[${this.constructor.name}] Not implemented yet`);
  }
}
