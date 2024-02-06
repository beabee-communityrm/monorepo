import { isAmountOfMoney } from "../utils/index.ts";
import { isCalloutComponentOfType } from "../utils/index.ts";
import { CalloutComponentType } from "../data/index.ts";

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
    if (
      !isCalloutComponentOfType(schema, CalloutComponentType.INPUT_CURRENCY)
    ) {
      throw new Error("Schema is not a currency component");
    }

    if (schema.validate?.required && answer === undefined) {
      return true;
    }

    return isAmountOfMoney(answer);
  };
