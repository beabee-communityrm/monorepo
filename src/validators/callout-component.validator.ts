import {
  calloutComponentContentValidator,
  calloutComponentFileValidator,
  calloutComponentInputValidator,
  calloutComponentNestableValidator,
  calloutComponentRadioValidator,
  calloutComponentSelectValidator,
} from "./index.ts";

import { isNestableComponent } from "../utils/index.ts";

import type {
  CalloutComponentAddressType,
  CalloutComponentCheckboxType,
  CalloutComponentContentType,
  CalloutComponentCurrencyType,
  CalloutComponentDateTimeType,
  CalloutComponentEmailType,
  CalloutComponentFileType,
  CalloutComponentNestableType,
  CalloutComponentNumberType,
  CalloutComponentPhoneNumberType,
  CalloutComponentRadioType,
  CalloutComponentSchema,
  CalloutComponentSelectType,
  CalloutComponentSignatureType,
  CalloutComponentTextType,
  CalloutComponentTimeType,
  CalloutComponentUrlType,
  CalloutResponseAnswer,
  CalloutResponseAnswersNestable,
  ValidatorCallout,
  ValidatorCalloutNestable,
} from "../types/index.ts";

/**
 * A map of validator classes to be used for Callout component.
 */
const calloutValidatorsMap: Record<
  | CalloutComponentContentType
  | CalloutComponentFileType
  | CalloutComponentAddressType
  | CalloutComponentCheckboxType
  | CalloutComponentNumberType
  | CalloutComponentPhoneNumberType
  | CalloutComponentCurrencyType
  | CalloutComponentDateTimeType
  | CalloutComponentTimeType
  | CalloutComponentUrlType
  | CalloutComponentSignatureType
  | CalloutComponentEmailType
  | CalloutComponentTextType
  | CalloutComponentRadioType
  | CalloutComponentSelectType,
  ValidatorCallout
> = {
  email: calloutComponentInputValidator,
  address: calloutComponentInputValidator,
  checkbox: calloutComponentInputValidator,
  currency: calloutComponentInputValidator,
  datetime: calloutComponentInputValidator,
  number: calloutComponentInputValidator,
  phoneNumber: calloutComponentInputValidator,
  signature: calloutComponentInputValidator,
  time: calloutComponentInputValidator,
  url: calloutComponentInputValidator,
  content: calloutComponentContentValidator,
  file: calloutComponentFileValidator,
  select: calloutComponentSelectValidator,

  // TEXT
  textfield: calloutComponentInputValidator,
  textarea: calloutComponentInputValidator,

  // RADIO
  radio: calloutComponentRadioValidator,
  selectboxes: calloutComponentRadioValidator,
};

/**
 * A map of validator classes to be used for Callout component.
 */
const calloutNestableValidatorsMap: Record<
  CalloutComponentNestableType,
  ValidatorCalloutNestable
> = {
  // NESTABLE
  panel: calloutComponentNestableValidator,
  well: calloutComponentNestableValidator,
  tabs: calloutComponentNestableValidator,
};

export const calloutComponentValidator:
  | ValidatorCallout
  | ValidatorCalloutNestable = (
    schema: CalloutComponentSchema,
    answer: CalloutResponseAnswer | CalloutResponseAnswersNestable,
  ): boolean => {
    if (isNestableComponent(schema)) {
      const validator = calloutNestableValidatorsMap[schema.type];
      if (!validator) {
        console.error(`No validator found for ${schema.type}`);
        return false;
      }
      return validator(schema, answer as CalloutResponseAnswersNestable);
    } else {
      const validator = calloutValidatorsMap[schema.type];
      if (!validator) {
        console.error(`No validator found for ${schema.type}`);
        return false;
      }
      return validator(
        schema,
        answer as CalloutResponseAnswer,
      );
    }
  };
