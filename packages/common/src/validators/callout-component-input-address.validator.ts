import type {
  CalloutComponentInputAddressSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentInputAddressValidator: ValidatorCalloutComponent<
  CalloutComponentInputAddressSchema
> = (
  _schema: CalloutComponentInputAddressSchema,
  _answer: CalloutResponseAnswer,
): boolean => {
  throw new Error(
    `[calloutComponentInputAddressValidator] Not implemented yet`,
  );
};
