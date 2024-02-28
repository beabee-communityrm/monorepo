import { calloutComponentContentValidator } from "./callout-component-content.validator.ts";
import { calloutComponentInputAddressValidator } from "./callout-component-input-address.validator.ts";
import { calloutComponentInputCheckboxValidator } from "./callout-component-input-checkbox.validator.ts";
import { calloutComponentInputCurrencyValidator } from "./callout-component-input-currency.validator.ts";
import { calloutComponentInputDateTimeValidator } from "./callout-component-input-date-time.validator.ts";
import { calloutComponentInputEmailValidator } from "./callout-component-input-email.validator.ts";
import { calloutComponentInputFileValidator } from "./callout-component-input-file.validator.ts";
import { calloutComponentInputNumberValidator } from "./callout-component-input-number.validator.ts";
import { calloutComponentInputSelectValidator } from "./callout-component-input-select.validator.ts";
import { calloutComponentInputPhoneNumberValidator } from "./callout-component-input-phone-number.validator.ts";
import { calloutComponentInputSelectableValidator } from "./callout-component-input-selectable.validator.ts";
import { calloutComponentInputSignatureValidator } from "./callout-component-input-signature.validator.ts";
import { calloutComponentInputTextValidator } from "./callout-component-input-text.validator.ts";
import { calloutComponentInputTimeValidator } from "./callout-component-input-time.validator.ts";
import { calloutComponentInputUrlValidator } from "./callout-component-input-url.validator.ts";

import { CalloutComponentType } from "../data/index.ts";

import type {
  CalloutComponentNestableSchema,
  CalloutComponentSchema,
  CalloutResponseAnswer,
  CalloutResponseAnswersNestable,
  ValidatorCalloutComponent,
} from "../types/index.ts";

export const calloutComponentNestableValidator = (
  schema: CalloutComponentNestableSchema,
  answers: CalloutResponseAnswersNestable,
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
const calloutValidatorsMap: Record<
  CalloutComponentSchema["type"],
  // deno-lint-ignore no-explicit-any
  ValidatorCalloutComponent<any>
> = {
  [CalloutComponentType.CONTENT]: calloutComponentContentValidator,

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
    calloutComponentInputSelectableValidator,

  // NESTABLE
  [CalloutComponentType.NESTABLE_PANEL]: calloutComponentNestableValidator,
  [CalloutComponentType.NESTABLE_WELL]: calloutComponentNestableValidator,
  [CalloutComponentType.NESTABLE_TABS]: calloutComponentNestableValidator,
};

export const calloutComponentValidator = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer | CalloutResponseAnswer[] | undefined,
): boolean => {
  const validator = calloutValidatorsMap[schema.type];
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
};
