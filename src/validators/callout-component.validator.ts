import {
  BaseCalloutNestableValidator,
  BaseCalloutValidator,
  CalloutComponentContentValidator,
  CalloutComponentFileValidator,
  CalloutComponentInputValidator,
  CalloutComponentNestableValidator,
  CalloutComponentRadioValidator,
  CalloutComponentSelectValidator,
} from "./index.ts";

import type {
  CalloutComponentSchema,
  CalloutComponentType,
  CalloutResponseAnswer,
  CalloutResponseAnswersNestable,
} from "../types/index.ts";

/**
 * A map of validator classes to be used for Callout component.
 */
const calloutValidatorsMap: Record<
  CalloutComponentType,
  BaseCalloutValidator | BaseCalloutNestableValidator
> = {
  // INPUT
  email: new CalloutComponentInputValidator(),
  address: new CalloutComponentInputValidator(),
  button: new CalloutComponentInputValidator(),
  checkbox: new CalloutComponentInputValidator(),
  textarea: new CalloutComponentInputValidator(),
  password: new CalloutComponentInputValidator(),
  currency: new CalloutComponentInputValidator(),
  datetime: new CalloutComponentInputValidator(),
  number: new CalloutComponentInputValidator(),
  phoneNumber: new CalloutComponentInputValidator(),
  signature: new CalloutComponentInputValidator(),
  textfield: new CalloutComponentInputValidator(),
  time: new CalloutComponentInputValidator(),
  url: new CalloutComponentInputValidator(),

  content: new CalloutComponentContentValidator(),

  // FILE
  file: new CalloutComponentFileValidator(),

  // NESTABLE
  panel: new CalloutComponentNestableValidator(),
  well: new CalloutComponentNestableValidator(),
  tabs: new CalloutComponentNestableValidator(),

  // RADIO
  radio: new CalloutComponentRadioValidator(),
  selectboxes: new CalloutComponentRadioValidator(),

  // SELECT
  select: new CalloutComponentSelectValidator(),
};

export class CalloutComponentValidator extends BaseCalloutValidator {
  validate(
    schema: CalloutComponentSchema,
    answer: CalloutResponseAnswer | CalloutResponseAnswersNestable,
  ): boolean {
    const validator = calloutValidatorsMap[schema.type];

    if (!validator) {
      console.error(`No validator found for ${schema.type}`);
      return false;
    }
    if (validator instanceof BaseCalloutValidator) {
      return validator.validate(schema, answer as CalloutResponseAnswer);
    } else if (validator instanceof BaseCalloutNestableValidator) {
      return validator.validate(
        schema,
        answer as CalloutResponseAnswersNestable,
      );
    }
    throw new Error(`No validator found for ${schema.type}`);
  }
}
