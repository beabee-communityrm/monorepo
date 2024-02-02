import { isAmountOfMoney, isCalloutInputUrlComponent } from "../utils/index.ts";
import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputCurrencyValidator: ValidatorCalloutComponent =
  (
    schema: CalloutComponentSchema,
    answer: CalloutResponseAnswer,
  ): boolean => {
    if (!isCalloutInputUrlComponent(schema)) {
      throw new Error("Schema is not a currency component");
    }

    if (schema.validate?.required && answer === undefined) {
      return true;
    }

    return isAmountOfMoney(answer);
  };
