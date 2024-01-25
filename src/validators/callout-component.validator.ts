import {
  BaseCalloutValidator,
  BaseValidator,
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
} from "../types/index.ts";

/**
 * A map of validator classes to be used for Callout component.
 */
const calloutValidatorsMap: Record<CalloutComponentType, BaseValidator> = {
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
    answer: CalloutResponseAnswer | CalloutResponseAnswer[],
  ): boolean {
    const answers = Array.isArray(answer) ? answer : [answer];
    const validator = calloutValidatorsMap[schema.type];

    if (!validator) {
      console.error(`No validator found for ${schema.type}`);
      return false;
    }
    return validator.validate(schema, answers);
  }
}
