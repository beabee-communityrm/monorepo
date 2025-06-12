import type {
  CalloutComponentInputAddressSchema,
  CalloutComponentInputCheckboxSchema,
  CalloutComponentInputCurrencySchema,
  CalloutComponentInputDateTimeSchema,
  CalloutComponentInputEmailSchema,
  CalloutComponentInputFileSchema,
  CalloutComponentInputNumberSchema,
  CalloutComponentInputPhoneNumberSchema,
  CalloutComponentInputSelectSchema,
  CalloutComponentInputSelectableSchema,
  CalloutComponentInputSignatureSchema,
  CalloutComponentInputTextSchema,
  CalloutComponentInputTimeSchema,
  CalloutComponentInputUrlSchema,
} from './index.js';

/** Any callout input component schema */
export type CalloutComponentInputSchema =
  | CalloutComponentInputSelectableSchema
  | CalloutComponentInputAddressSchema
  | CalloutComponentInputCheckboxSchema
  | CalloutComponentInputCurrencySchema
  | CalloutComponentInputDateTimeSchema
  | CalloutComponentInputEmailSchema
  | CalloutComponentInputFileSchema
  | CalloutComponentInputNumberSchema
  | CalloutComponentInputPhoneNumberSchema
  | CalloutComponentInputSelectSchema
  | CalloutComponentInputSignatureSchema
  | CalloutComponentInputTextSchema
  | CalloutComponentInputTimeSchema
  | CalloutComponentInputUrlSchema;
