import { ClientApiErrorData } from '@beabee/beabee-common';

import { BadRequestError as _BadRequestError } from 'routing-controllers';

/**
 * BadRequestError with optional code
 */
export class BadRequestError
  extends _BadRequestError
  implements ClientApiErrorData
{
  httpCode = 400;
  code = 'BAD_REQUEST';

  constructor({ message, code }: { message?: string; code?: string } = {}) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
    if (code) {
      this.code = code;
    }
  }
}
