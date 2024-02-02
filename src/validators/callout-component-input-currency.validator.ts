import { isCalloutInputUrlComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputCurrencyValidator: ValidatorCalloutComponent =
  (
    schema: CalloutComponentSchema,
    _answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputUrlComponent(schema)) {
      throw new Error("Schema is not a currency component");
    }

    throw new Error(
      `[calloutComponentInputCurrencyValidator] Not implemented yet`,
    );
  };
