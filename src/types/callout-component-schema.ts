import type {
  CalloutComponentAddressSchema,
  CalloutComponentCheckboxSchema,
  CalloutComponentContentSchema,
  CalloutComponentCurrencySchema,
  CalloutComponentDateTimeSchema,
  CalloutComponentEmailSchema,
  CalloutComponentFileSchema,
  CalloutComponentNestableSchema,
  CalloutComponentNumberSchema,
  CalloutComponentPhoneNumberSchema,
  CalloutComponentRadioSchema,
  CalloutComponentSelectSchema,
  CalloutComponentSignatureSchema,
  CalloutComponentTextSchema,
  CalloutComponentTimeSchema,
  CalloutComponentUrlSchema,
} from "./index.ts";

export type CalloutComponentSchema =
  | CalloutComponentAddressSchema
  | CalloutComponentCheckboxSchema
  | CalloutComponentContentSchema
  | CalloutComponentCurrencySchema
  | CalloutComponentDateTimeSchema
  | CalloutComponentEmailSchema
  | CalloutComponentFileSchema
  | CalloutComponentNestableSchema
  | CalloutComponentNumberSchema
  | CalloutComponentPhoneNumberSchema
  | CalloutComponentRadioSchema
  | CalloutComponentSelectSchema
  | CalloutComponentSignatureSchema
  | CalloutComponentTextSchema
  | CalloutComponentTimeSchema
  | CalloutComponentUrlSchema;
