import { isCalloutInputCheckboxComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputCheckboxValidator: ValidatorCalloutComponent =
  (
    schema: CalloutComponentSchema,
    _answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputCheckboxComponent(schema)) {
      throw new Error("Schema is not a checkbox component");
    }

    throw new Error(
      `[calloutComponentInputCheckboxValidator] Not implemented yet`,
    );
  };
