import { isCalloutInputSelectComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentSelectValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputSelectComponent(schema)) {
    throw new Error("Schema is not a select component");
  }

  if (!schema.validate?.required && !answer) {
    return true;
  }

  const optionValue = schema.data.values.find((v) => v.value === answer);
  return !!optionValue;
};
