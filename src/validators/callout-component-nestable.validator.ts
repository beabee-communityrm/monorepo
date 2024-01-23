import { BaseValidator, CalloutComponentValidator } from "./index.ts";
import { isNestableComponent } from "../utils/index.ts";

import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
} from "../types/index.ts";

export class CalloutComponentNestableValidator extends BaseValidator {
  validate(
    schema: CalloutComponentSchema,
    answers: Record<string, CalloutResponseAnswer | CalloutResponseAnswer[]>,
  ): boolean {
    if (!isNestableComponent(schema)) {
      throw new Error(
        `[${this.constructor.name}] validate() -> schema is not nestable component`,
      );
    }
    let valid = true;
    for (const component of schema.components) {
      const validator = new CalloutComponentValidator();
      const answer = answers[component.key];
      if (!answer) {
        throw new Error(
          `[${this.constructor.name}] validate() -> no answer`,
        );
      }
      valid = validator.validate(component, answer) && valid;
      if (!valid) {
        break;
      }
    }
    return valid;
  }
}
