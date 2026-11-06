import {
  type CalloutComponentInputSelectableRadioSchema,
  type CalloutComponentInputTextFieldSchema,
  CalloutComponentType,
} from '@beabee/beabee-common';

export const textfield = (
  key: string,
  label: string,
  extra: Partial<CalloutComponentInputTextFieldSchema> = {}
): CalloutComponentInputTextFieldSchema => ({
  id: key,
  key,
  type: CalloutComponentType.INPUT_TEXT_FIELD,
  label,
  input: true,
  validate: { required: false },
  ...extra,
});

export const radio = (
  key: string,
  label: string,
  values: CalloutComponentInputSelectableRadioSchema['values']
): CalloutComponentInputSelectableRadioSchema => ({
  id: key,
  key,
  type: CalloutComponentType.INPUT_SELECTABLE_RADIO,
  label,
  input: true,
  validate: { required: false },
  values,
});
