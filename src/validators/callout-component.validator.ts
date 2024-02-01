import {
  calloutComponentFileValidator,
  calloutComponentInputValidator,
  calloutComponentNestableValidator,
  calloutComponentRadioValidator,
  calloutComponentSelectValidator,
} from "./index.ts";

import {
  isCalloutContentComponent,
  isCalloutInputComponent,
  isCalloutNestableComponent,
} from "../utils/index.ts";

import type {
  CalloutComponentBaseInputSchema,
  CalloutComponentBaseNestableSchema,
  CalloutComponentSchema,
  CalloutResponseAnswer,
  CalloutResponseAnswersNestable,
  ValidatorCalloutInput,
  ValidatorCalloutNestable,
} from "../types/index.ts";

/**
 * A map of validator classes to be used for Callout component.
 */
const calloutInputValidatorsMap: Record<
  CalloutComponentBaseInputSchema["type"],
  ValidatorCalloutInput
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
  file: calloutComponentFileValidator,
  select: calloutComponentSelectValidator,

  // Text
  textfield: calloutComponentInputValidator,
  textarea: calloutComponentInputValidator,

  // Selectable
  radio: calloutComponentRadioValidator,
  selectboxes: calloutComponentRadioValidator,
};

/**
 * A map of validator classes to be used for Callout component.
 */
const calloutNestableValidatorsMap: Record<
  CalloutComponentBaseNestableSchema["type"],
  ValidatorCalloutNestable
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
    return true;
  }

  throw new Error(
    `[calloutComponentValidator] No validator found for ${
      // deno-lint-ignore no-explicit-any
      (schema as any).type}`,
  );
};
