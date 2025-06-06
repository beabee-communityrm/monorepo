import { Rule } from '@beabee/beabee-common';
import { BadRequestError } from 'routing-controllers';

export class InvalidRuleError extends BadRequestError {
  readonly code = 'invalid-rule';

  constructor(
    readonly rule: Rule,
    readonly message: string
  ) {
    super();
    Object.setPrototypeOf(this, InvalidRuleError.prototype);
  }
}
