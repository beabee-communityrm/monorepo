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

export const calloutComponentNestableValidator: ValidatorCalloutComponent<
  CalloutComponentNestableSchema
> = (
  schema: CalloutComponentNestableSchema,
  answerMap: Record<string, CalloutResponseAnswer | CalloutResponseAnswer[]>,
): boolean => {
  let valid = true;
  for (const component of schema.components) {
    const answer = answerMap[component.key];
    const answers = Array.isArray(answer) ? answer : [answer];
    if (!answer) {
      throw new Error(
        `[calloutComponentNestableValidator] no answer`,
      );
    }
    for (const _answersLevel2 of answers) {
      const answersLevel2 = Array.isArray(_answersLevel2)
        ? _answersLevel2
        : [_answersLevel2];
      for (const answer of answersLevel2) {
        valid = calloutComponentValidator(component, answer) && valid;
        if (!valid) {
          return false;
        }
      }
    }
  }
  return valid;
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
  answer: CalloutResponseAnswer | CalloutResponseAnswersNestable,
): boolean => {
  const validator = calloutValidatorsMap[schema.type];
  if (!validator) {
    console.error(`No validator found for ${schema.type}`);
    return false;
  }

  return validator(
    schema,
    answer as CalloutResponseAnswer,
  );
};
