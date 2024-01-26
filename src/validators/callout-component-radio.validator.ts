import { BaseValidator } from "./base.validator.ts";
import type {
  CalloutComponentRadioSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export class CalloutComponentRadioValidator extends BaseValidator {
  validate(
    _schema: CalloutComponentRadioSchema,
    _answer: CalloutResponseAnswer,
  ): boolean {
    throw new Error(`[${this.constructor.name}] Not implemented yet`);
  }
}
