import { isCalloutComponentOfType } from "../utils/index.ts";
import { CalloutComponentType } from "../data/index.ts";

import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputSelectValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutComponentOfType(schema, CalloutComponentType.INPUT_SELECT)) {
    throw new Error("Schema is not a select component");
  }

  if (!schema.validate?.required && !answer) {
    return true;
  }

  const optionValue = schema.data.values.find((v) => v.value === answer);
  return !!optionValue;
};
