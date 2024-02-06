import { isCalloutComponentOfType } from "../utils/index.ts";
import { CalloutComponentType } from "../data/index.ts";

import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputCheckboxValidator: ValidatorCalloutComponent =
  (
    schema: CalloutComponentSchema,
    answer: CalloutResponseAnswer,
  ): boolean => {
    if (
      !isCalloutComponentOfType(schema, CalloutComponentType.INPUT_CHECKBOX)
    ) {
      throw new Error("Schema is not a checkbox component");
    }

    if (schema.validate?.required && !answer) {
      return true;
    }

    return typeof answer === "boolean";
  };
