import { calloutComponentContentValidator } from "./callout-component-content.validator.js";
import { calloutComponentInputAddressValidator } from "./callout-component-input-address.validator.js";
import { calloutComponentInputCheckboxValidator } from "./callout-component-input-checkbox.validator.js";
import { calloutComponentInputCurrencyValidator } from "./callout-component-input-currency.validator.js";
import { calloutComponentInputDateTimeValidator } from "./callout-component-input-date-time.validator.js";
import { calloutComponentInputEmailValidator } from "./callout-component-input-email.validator.js";
import { calloutComponentInputFileValidator } from "./callout-component-input-file.validator.js";
import { calloutComponentInputNumberValidator } from "./callout-component-input-number.validator.js";
import { calloutComponentInputSelectValidator } from "./callout-component-input-select.validator.js";
import { calloutComponentInputPhoneNumberValidator } from "./callout-component-input-phone-number.validator.js";
import { calloutComponentInputSelectableValidator } from "./callout-component-input-selectable.validator.js";
import { calloutComponentInputSignatureValidator } from "./callout-component-input-signature.validator.js";
import { calloutComponentInputTextValidator } from "./callout-component-input-text.validator.js";
import { calloutComponentInputTimeValidator } from "./callout-component-input-time.validator.js";
import { calloutComponentInputUrlValidator } from "./callout-component-input-url.validator.js";

import {
  CalloutComponentBaseType,
  CalloutComponentType
} from "../data/index.js";
import { isCalloutComponentOfBaseType } from "../utils/callouts.js";

import type {
  CalloutComponentInputSchema,
  CalloutComponentNestableSchema,
  CalloutComponentSchema,
  CalloutResponseAnswer,
  CalloutResponseAnswers,
  ValidatorCalloutComponent
} from "../types/index.js";

export const calloutComponentNestableValidator = (
  schema: CalloutComponentNestableSchema,
  answers: CalloutResponseAnswers
): boolean => {
  for (const component of schema.components) {
    const valid = calloutComponentValidator(component, answers[component.key]);
    if (!valid) {
      return false;
    }
  }
  return true;
};

/**
 * A map of validator classes to be used for Callout component.
 */
const calloutInputValidatorsMap: Record<
  CalloutComponentInputSchema["type"],
  ValidatorCalloutComponent<any>
> = {
  // Input
  [CalloutComponentType.INPUT_EMAIL]: calloutComponentInputEmailValidator,
  [CalloutComponentType.INPUT_ADDRESS]: calloutComponentInputAddressValidator,
  [CalloutComponentType.INPUT_CHECKBOX]: calloutComponentInputCheckboxValidator,
  [CalloutComponentType.INPUT_CURRENCY]: calloutComponentInputCurrencyValidator,
  [CalloutComponentType.INPUT_DATE_TIME]:
    calloutComponentInputDateTimeValidator,
  [CalloutComponentType.INPUT_NUMBER]: calloutComponentInputNumberValidator,
  [CalloutComponentType.INPUT_PHONE_NUMBER]:
    calloutComponentInputPhoneNumberValidator,
  [CalloutComponentType.INPUT_SIGNATURE]:
    calloutComponentInputSignatureValidator,
  [CalloutComponentType.INPUT_TIME]: calloutComponentInputTimeValidator,
  [CalloutComponentType.INPUT_URL]: calloutComponentInputUrlValidator,
  [CalloutComponentType.INPUT_FILE]: calloutComponentInputFileValidator,
  [CalloutComponentType.INPUT_SELECT]: calloutComponentInputSelectValidator,

  // Text
  [CalloutComponentType.INPUT_TEXT_FIELD]: calloutComponentInputTextValidator,
  [CalloutComponentType.INPUT_TEXT_AREA]: calloutComponentInputTextValidator,

  // Selectable
  [CalloutComponentType.INPUT_SELECTABLE_RADIO]:
    calloutComponentInputSelectableValidator,
  [CalloutComponentType.INPUT_SELECTABLE_SELECTBOXES]:
    calloutComponentInputSelectableValidator
};
export function calloutComponentInputValidator(
  schema: CalloutComponentInputSchema,
  answer: CalloutResponseAnswer | CalloutResponseAnswer[] | undefined
): boolean {
  const validator = calloutInputValidatorsMap[schema.type];
  if (!validator) {
    console.error(`No validator found for ${schema.type}`);
    return false;
  }

  if (answer === undefined) {
    return schema.validate?.required ? false : true;
  }

  const values = Array.isArray(answer) ? answer : [answer];
  for (const value of values) {
    const valid = validator(schema, value);
    if (!valid) {
      return false;
    }
  }

  return true;
}

export function calloutComponentValidator(
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer | CalloutResponseAnswer[] | undefined
): boolean;

export function calloutComponentValidator(
  schema: CalloutComponentNestableSchema,
  answer: CalloutResponseAnswers
): boolean;

export function calloutComponentValidator(
  schema: CalloutComponentSchema,
  answer:
    | CalloutResponseAnswer
    | CalloutResponseAnswer[]
    | undefined
    | CalloutResponseAnswers
): boolean {
  if (isCalloutComponentOfBaseType(schema, CalloutComponentBaseType.NESTABLE)) {
    return calloutComponentNestableValidator(
      schema,
      answer as CalloutResponseAnswers
    );
  }

  if (isCalloutComponentOfBaseType(schema, CalloutComponentBaseType.INPUT)) {
    return calloutComponentInputValidator(
      schema,
      answer as CalloutResponseAnswer | CalloutResponseAnswer[] | undefined
    );
  }

  if (isCalloutComponentOfBaseType(schema, CalloutComponentBaseType.CONTENT)) {
    return calloutComponentContentValidator(schema, answer as unknown);
  }

  throw new Error("Invalid schema type");
}
