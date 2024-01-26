import { BaseValidator } from "./base.validator.ts";
import type {
  CalloutComponentContentSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export class CalloutComponentContentValidator extends BaseValidator {
  validate(
    _schema: CalloutComponentContentSchema,
    _answer: CalloutResponseAnswer,
  ): boolean {
    throw new Error(`[${this.constructor.name}] Not implemented yet`);
  }
}
