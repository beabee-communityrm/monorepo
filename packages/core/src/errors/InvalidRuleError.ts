import { ApiErrorCode, InvalidRuleErrorData } from '@beabee/beabee-common';
import { Rule } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class InvalidRuleError
  extends BadRequestError
  implements InvalidRuleErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.INVALID_RULE;

  constructor(
    readonly rule: Rule,
    readonly message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, InvalidRuleError.prototype);
  }
}
