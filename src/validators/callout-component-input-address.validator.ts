import type {
  CalloutComponentInputAddressSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputAddressValidator: ValidatorCalloutComponent<
  CalloutComponentInputAddressSchema
> = (
  schema: CalloutComponentInputAddressSchema,
  answer: CalloutResponseAnswer,
): boolean => {
  // If answer is not required and is undefined return `true` because we don't need to validate this
  if (!schema.validate?.required && answer === undefined) {
    return true;
  }

  throw new Error(
    `[calloutComponentInputAddressValidator] Not implemented yet`,
  );
};
