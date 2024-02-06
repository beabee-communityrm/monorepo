import { isCalloutComponentOfBaseType } from "../utils/index.ts";
import { CalloutComponentBaseType } from "../data/index.ts";

import type {
  CalloutComponentSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputSelectableValidator:
  ValidatorCalloutComponent = (
    schema: CalloutComponentSchema,
    answer: CalloutResponseAnswer,
  ): boolean => {
    if (
      !isCalloutComponentOfBaseType(
        schema,
        CalloutComponentBaseType.INPUT_SELECTABLE,
      )
    ) {
      throw new Error("Schema is not a selectable component");
    }

    if (!schema.validate?.required && !answer) {
      return true;
    }

    const optionValue = schema.values.find((v) => v.value === answer);
    return !!optionValue;
  };
