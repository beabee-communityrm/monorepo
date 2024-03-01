import type {
  CalloutComponentInputSelectableSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputSelectableValidator:
  ValidatorCalloutComponent<CalloutComponentInputSelectableSchema> = (
    schema: CalloutComponentInputSelectableSchema,
    answer: CalloutResponseAnswer,
  ): boolean => {
    const optionValue = schema.values.find((v) => v.value === answer);
    return !!optionValue;
  };
