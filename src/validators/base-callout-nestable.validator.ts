import { BaseValidator } from "./index.ts";

import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export abstract class BaseCalloutNestableValidator extends BaseValidator {
  abstract validate(
    schema: CalloutComponentSchema,
    answerMap: Record<string, CalloutResponseAnswer | CalloutResponseAnswer[]>,
  ): boolean;
}
