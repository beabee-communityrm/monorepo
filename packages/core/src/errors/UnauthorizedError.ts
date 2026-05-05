import type { UnauthorizedErrorData } from '@beabee/beabee-common';
import { LOGIN_CODES } from '@beabee/beabee-common';

import { UnauthorizedError as _UnauthorizedError } from 'routing-controllers';

/**
 * UnauthorizedError with optional code
 */
export class UnauthorizedError
  extends _UnauthorizedError
  implements UnauthorizedErrorData
{
  readonly httpCode = 401;

  constructor(
    readonly code = LOGIN_CODES.UNAUTHORIZED,
    message?: string
  ) {
    super(message || `Unauthorized with code ${code}`);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
