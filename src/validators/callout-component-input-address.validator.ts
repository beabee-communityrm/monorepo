import { isCalloutInputAddressComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputAddressValidator: ValidatorCalloutComponent =
  (
    schema: CalloutComponentSchema,
    _answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputAddressComponent(schema)) {
      throw new Error("Schema is not a address component");
    }
    throw new Error(
      `[calloutComponentInputAddressValidator] Not implemented yet`,
    );
  };
