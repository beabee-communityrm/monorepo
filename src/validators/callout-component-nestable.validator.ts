import { calloutComponentValidator } from "./callout-component.validator.ts";
import { isCalloutNestableComponent } from "../utils/index.ts";

import type {
  CalloutComponentNestableSchema,
  CalloutResponseAnswer,
  ValidatorCalloutNestable,
} from "../types/index.ts";

export const calloutComponentNestableValidator: ValidatorCalloutNestable = (
  schema: CalloutComponentNestableSchema,
  answerMap: Record<string, CalloutResponseAnswer | CalloutResponseAnswer[]>,
): boolean => {
  if (!isCalloutNestableComponent(schema)) {
    throw new Error(
      `[calloutComponentNestableValidator] schema is not nestable component`,
    );
  }
  let valid = true;
  for (const component of schema.components) {
    const answer = answerMap[component.key];
    const answers = Array.isArray(answer) ? answer : [answer];
    if (!answer) {
      throw new Error(
        `[calloutComponentNestableValidator] no answer`,
      );
    }
    for (const _answersLevel2 of answers) {
      const answersLevel2 = Array.isArray(_answersLevel2)
        ? _answersLevel2
        : [_answersLevel2];
      for (const answer of answersLevel2) {
        valid = calloutComponentValidator(component, answer) && valid;
        if (!valid) {
          return false;
        }
      }
    }
  }
  return valid;
};
