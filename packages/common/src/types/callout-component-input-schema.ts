import type {
  CalloutComponentInputAddressSchema,
  CalloutComponentInputCheckboxSchema,
  CalloutComponentInputCurrencySchema,
  CalloutComponentInputDateTimeSchema,
  CalloutComponentInputEmailSchema,
  CalloutComponentInputFileSchema,
  CalloutComponentInputNumberSchema,
  CalloutComponentInputPhoneNumberSchema,
  CalloutComponentInputSelectableSchema,
  CalloutComponentInputSelectSchema,
  CalloutComponentInputSignatureSchema,
  CalloutComponentInputTextSchema,
  CalloutComponentInputTimeSchema,
  CalloutComponentInputUrlSchema,
} from "./index.ts";

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
