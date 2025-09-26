import { ClientApiErrorData } from '@beabee/beabee-common';

import { NotFoundError as _NotFoundError } from 'routing-controllers';

/**
 * NotFoundError with optional code
 */
export class NotFoundError
  extends _NotFoundError
  implements ClientApiErrorData
{
  httpCode = 404;
  code = 'NOT_FOUND';

  constructor({ message, code }: { message?: string; code?: string } = {}) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
    if (code) {
      this.code = code;
    }
  }
}
