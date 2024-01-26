import { BaseValidator } from "./base.validator.ts";
import type {
  CalloutComponentSelectSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export class CalloutComponentSelectValidator extends BaseValidator {
  validate(
    _schema: CalloutComponentSelectSchema,
    _answer: CalloutResponseAnswer,
  ): boolean {
    throw new Error(`[${this.constructor.name}] Not implemented yet`);
  }
}
