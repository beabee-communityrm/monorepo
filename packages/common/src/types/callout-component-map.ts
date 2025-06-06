import type { CalloutComponentType } from '../data/index.js';

import type {
  CalloutComponentContentSchema,
  CalloutComponentInputAddressSchema,
  CalloutComponentInputCheckboxSchema,
  CalloutComponentInputCurrencySchema,
  CalloutComponentInputDateTimeSchema,
  CalloutComponentInputEmailSchema,
  CalloutComponentInputFileSchema,
  CalloutComponentInputNumberSchema,
  CalloutComponentInputPhoneNumberSchema,
  CalloutComponentInputSelectableRadioSchema,
  CalloutComponentInputSelectableSelectboxesSchema,
  CalloutComponentInputSelectSchema,
  CalloutComponentInputSignatureSchema,
  CalloutComponentInputTextAreaSchema,
  CalloutComponentInputTextFieldSchema,
  CalloutComponentInputTimeSchema,
  CalloutComponentInputUrlSchema,
  CalloutComponentNestablePanelSchema,
  CalloutComponentNestableTabsSchema,
  CalloutComponentNestableWellSchema,
} from './index.js';

type CalloutComponentSchemas = {
  [CalloutComponentType.CONTENT]: CalloutComponentContentSchema;

  [CalloutComponentType.INPUT_ADDRESS]: CalloutComponentInputAddressSchema;
  [CalloutComponentType.INPUT_CHECKBOX]: CalloutComponentInputCheckboxSchema;
  [CalloutComponentType.INPUT_CURRENCY]: CalloutComponentInputCurrencySchema;
  [CalloutComponentType.INPUT_DATE_TIME]: CalloutComponentInputDateTimeSchema;
  [CalloutComponentType.INPUT_EMAIL]: CalloutComponentInputEmailSchema;
  [CalloutComponentType.INPUT_FILE]: CalloutComponentInputFileSchema;
  [CalloutComponentType.INPUT_NUMBER]: CalloutComponentInputNumberSchema;
  [CalloutComponentType.INPUT_PHONE_NUMBER]: CalloutComponentInputPhoneNumberSchema;
  [CalloutComponentType.INPUT_SELECT]: CalloutComponentInputSelectSchema;
  [CalloutComponentType.INPUT_SELECTABLE_RADIO]: CalloutComponentInputSelectableRadioSchema;
  [CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES]: CalloutComponentInputSelectableSelectboxesSchema;
  [CalloutComponentType.INPUT_SIGNATURE]: CalloutComponentInputSignatureSchema;
  [CalloutComponentType.INPUT_TEXT_AREA]: CalloutComponentInputTextAreaSchema;
  [CalloutComponentType.INPUT_TEXT_FIELD]: CalloutComponentInputTextFieldSchema;
  [CalloutComponentType.INPUT_TIME]: CalloutComponentInputTimeSchema;
  [CalloutComponentType.INPUT_URL]: CalloutComponentInputUrlSchema;

  [CalloutComponentType.NESTABLE_PANEL]: CalloutComponentNestablePanelSchema;
  [CalloutComponentType.NESTABLE_TABS]: CalloutComponentNestableTabsSchema;
  [CalloutComponentType.NESTABLE_WELL]: CalloutComponentNestableWellSchema;
};

/**
 * Each key is a CalloutComponentType and the value is the corresponding schema from CalloutComponentSchemas
 */
export type CalloutComponentMap = {
  [K in CalloutComponentType]: CalloutComponentSchemas[K];
};
