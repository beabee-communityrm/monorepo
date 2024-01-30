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
  CalloutComponentContentType,
  CalloutComponentFileType,
  CalloutComponentInputType,
  CalloutComponentNestableType,
  CalloutComponentRadioType,
  CalloutComponentSchema,
  CalloutComponentSelectType,
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
  | CalloutComponentInputType
  | CalloutComponentRadioType
  | CalloutComponentSelectType,
  ValidatorCallout
> = {
  // INPUT
  email: calloutComponentInputValidator,
  address: calloutComponentInputValidator,
  button: calloutComponentInputValidator,
  checkbox: calloutComponentInputValidator,
  textarea: calloutComponentInputValidator,
  password: calloutComponentInputValidator,
  currency: calloutComponentInputValidator,
  datetime: calloutComponentInputValidator,
  number: calloutComponentInputValidator,
  phoneNumber: calloutComponentInputValidator,
  signature: calloutComponentInputValidator,
  textfield: calloutComponentInputValidator,
  time: calloutComponentInputValidator,
  url: calloutComponentInputValidator,

  content: calloutComponentContentValidator,

  // FILE
  file: calloutComponentFileValidator,

  // RADIO
  radio: calloutComponentRadioValidator,
  selectboxes: calloutComponentRadioValidator,

  // SELECT
  select: calloutComponentSelectValidator,
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
