import type {
  CalloutComponentInputAddressSchema,
  CalloutResponseAnswer,
  ValidatorCalloutComponent,
} from '../types/index.js';

export const calloutComponentInputAddressValidator: ValidatorCalloutComponent<
  CalloutComponentInputAddressSchema
> = (
  _schema: CalloutComponentInputAddressSchema,
  _answer: CalloutResponseAnswer
): boolean => {
  throw new Error(
    `[calloutComponentInputAddressValidator] Not implemented yet`
  );
};
