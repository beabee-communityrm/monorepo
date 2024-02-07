import { isCalloutComponentOfType, isEmail } from "../utils/index.ts";
import { CalloutComponentType } from "../data/index.ts";

import type {
  CalloutComponentInputEmailSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputEmailValidator: ValidatorCalloutComponent<
  CalloutComponentInputEmailSchema
> = (
  schema: CalloutComponentInputEmailSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutComponentOfType(schema, CalloutComponentType.INPUT_EMAIL)) {
    throw new Error("Schema is not a email component");
  }

  // If answer is not required and is undefined return `true` because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  return isEmail(answer);
};
