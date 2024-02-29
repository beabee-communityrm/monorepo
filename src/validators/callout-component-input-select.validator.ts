import type {
  CalloutComponentInputSelectSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputSelectValidator: ValidatorCalloutComponent<
  CalloutComponentInputSelectSchema
> = (
  schema: CalloutComponentInputSelectSchema,
  answer: CalloutResponseAnswer | undefined,
): boolean => {
  const optionValue = schema.data.values.find((v) => v.value === answer);
  return !!optionValue;
};
