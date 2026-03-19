import { ClientApiErrorData } from '@beabee/beabee-common';
import { Rule } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class InvalidRuleError
  extends BadRequestError
  implements ClientApiErrorData
{
  readonly code = 'invalid-rule';

  constructor(
    readonly rule: Rule,
    readonly message: string
  ) {
    super();
    Object.setPrototypeOf(this, InvalidRuleError.prototype);
  }
}
