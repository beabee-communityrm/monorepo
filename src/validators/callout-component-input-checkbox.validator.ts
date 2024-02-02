import { isCalloutInputCheckboxComponent } from "../utils/index.ts";
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
    if (!isCalloutInputCheckboxComponent(schema)) {
      throw new Error("Schema is not a checkbox component");
    }

    if (schema.validate?.required && !answer) {
      return true;
    }

    return typeof answer === "boolean";
  };
