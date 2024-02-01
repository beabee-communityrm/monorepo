import {
  calloutComponentContentValidator,
  calloutComponentInputAddressValidator,
  calloutComponentInputCheckboxValidator,
  calloutComponentInputDateTimeValidator,
  calloutComponentInputFileValidator,
  calloutComponentInputSelectableValidator,
  calloutComponentInputTextValidator,
  calloutComponentInputTimeValidator,
  calloutComponentInputUrlValidator,
  calloutComponentInputValidator,
  calloutComponentNestableValidator,
  calloutComponentSelectValidator,
} from "./index.ts";

import {
  isCalloutContentComponent,
  isCalloutInputComponent,
  isCalloutNestableComponent,
} from "../utils/index.ts";

import type {
  CalloutComponentBaseNestableSchema,
  CalloutComponentInputSchema,
  CalloutComponentSchema,
  CalloutResponseAnswer,
  CalloutResponseAnswersNestable,
  ValidatorCalloutComponent,
  ValidatorCalloutComponentNestable,
} from "../types/index.ts";

/**
 * A map of validator classes to be used for Callout component.
 */
const calloutInputValidatorsMap: Record<
  CalloutComponentInputSchema["type"],
  ValidatorCalloutComponent
> = {
  email: calloutComponentInputValidator,
  address: calloutComponentInputAddressValidator,
  checkbox: calloutComponentInputCheckboxValidator,
  currency: calloutComponentInputValidator,
  datetime: calloutComponentInputDateTimeValidator,
  number: calloutComponentInputValidator,
  phoneNumber: calloutComponentInputValidator,
  signature: calloutComponentInputValidator,
  time: calloutComponentInputTimeValidator,
  url: calloutComponentInputUrlValidator,
  file: calloutComponentInputFileValidator,
  select: calloutComponentSelectValidator,

  // Text
  textfield: calloutComponentInputTextValidator,
  textarea: calloutComponentInputTextValidator,

  // Selectable
  radio: calloutComponentInputSelectableValidator,
  selectboxes: calloutComponentInputSelectableValidator,
};

/**
 * A map of validator classes to be used for Callout component.
 */
const calloutNestableValidatorsMap: Record<
  CalloutComponentBaseNestableSchema["type"],
  ValidatorCalloutComponentNestable
> = {
  // NESTABLE
  panel: calloutComponentNestableValidator,
  well: calloutComponentNestableValidator,
  tabs: calloutComponentNestableValidator,
};

export const calloutComponentValidator = (
  schema: CalloutComponentSchema,
  answer: CalloutResponseAnswer | CalloutResponseAnswersNestable,
): boolean => {
  if (isCalloutNestableComponent(schema)) {
    const validator = calloutNestableValidatorsMap[schema.type];
    if (!validator) {
      console.error(`No validator found for ${schema.type}`);
      return false;
    }
    return validator(schema, answer as CalloutResponseAnswersNestable);
  } else if (isCalloutInputComponent(schema)) {
    const validator = calloutInputValidatorsMap[schema.type];
    if (!validator) {
      console.error(`No validator found for ${schema.type}`);
      return false;
    }
    return validator(
      schema,
      answer as CalloutResponseAnswer,
    );
  } else if (isCalloutContentComponent(schema)) {
    // Content components are always valid
    return calloutComponentContentValidator(schema, answer);
  }

  throw new Error(
    `[calloutComponentValidator] No validator found for ${
      // deno-lint-ignore no-explicit-any
      (schema as any).type}`,
  );
};
