import { isCalloutInputAddressComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputAddressValidator: ValidatorCalloutComponent =
  (
    schema: CalloutComponentSchema,
    answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputAddressComponent(schema)) {
      throw new Error("Schema is not a address component");
    }

    // If answer is not required and is undefined return `true` because we don't need to validate this
    if (!schema.validate?.required && answer === undefined) {
      return true;
    }

    throw new Error(
      `[calloutComponentInputAddressValidator] Not implemented yet`,
    );
  };
