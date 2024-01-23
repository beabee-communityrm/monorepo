import { BaseValidator } from "./index.ts";

import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export abstract class BaseCalloutValidator extends BaseValidator {
  abstract validate(
    schema: CalloutComponentSchema,
    answer: CalloutResponseAnswer | CalloutResponseAnswer[],
  ): boolean;
}
