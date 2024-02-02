import { isCalloutInputTimeComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputTimeValidator: ValidatorCalloutComponent = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  if (!isCalloutInputTimeComponent(schema)) {
    throw new Error("Schema is not a time component");
  }

  // If answer is not required and is undefined return true because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  throw new Error(
    `[calloutComponentInputTimeValidator] Not implemented yet`,
  );
};
