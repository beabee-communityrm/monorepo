import { BaseCalloutValidator, UrlValidator } from "./index.ts";
import type {
  CalloutComponentFileSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export class CalloutComponentFileValidator extends BaseCalloutValidator {
  validate(
    _schema: CalloutComponentFileSchema,
    answer: CalloutResponseAnswer,
  ): boolean {
    const urlValidator = new UrlValidator();
    const answers = Array.isArray(answer) ? answer : [answer];

    for (const answer of answers) {
      if (!urlValidator.validate(answer.url)) {
        return false;
      }
    }

    // TODO: Validate file size and file pattern / type

    return true;
  }
}
