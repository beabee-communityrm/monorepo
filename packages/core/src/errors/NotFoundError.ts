import type { NotFoundErrorData } from '@beabee/beabee-common';
import { ApiErrorCode } from '@beabee/beabee-common';

import { NotFoundError as _NotFoundError } from 'routing-controllers';

export class NotFoundError extends _NotFoundError implements NotFoundErrorData {
  readonly httpCode = 404;
  readonly code = ApiErrorCode.NOT_FOUND;

  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
