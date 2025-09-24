import { ClientApiErrorData } from '@beabee/beabee-common';

import { UnauthorizedError as _UnauthorizedError } from 'routing-controllers';

/**
 * UnauthorizedError with optional code
 */
export class UnauthorizedError
  extends _UnauthorizedError
  implements ClientApiErrorData
{
  httpCode = 401;
  code = 'UNAUTHORIZED';

  constructor({ message, code }: { message?: string; code?: string } = {}) {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
    if (code) {
      this.code = code;
    }
  }
}
