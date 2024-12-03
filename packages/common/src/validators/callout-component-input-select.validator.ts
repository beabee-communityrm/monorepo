import type {
  CalloutComponentInputSelectSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.js";

export const calloutComponentInputSelectValidator: ValidatorCalloutComponent<
  CalloutComponentInputSelectSchema
> = (
  schema: CalloutComponentInputSelectSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  const optionValue = schema.data.values.find((v) => v.value === answer);
  return !!optionValue;
};
