import {
  ApiErrorCode,
  LOGIN_CODES,
  UnauthorizedErrorData,
} from '@beabee/beabee-common';

import { UnauthorizedError as _UnauthorizedError } from 'routing-controllers';

/**
 * UnauthorizedError with optional code
 */
export class UnauthorizedError
  extends _UnauthorizedError
  implements UnauthorizedErrorData
{
  readonly httpCode = 401;
  readonly code = ApiErrorCode.UNAUTHORIZED;

  constructor(
    readonly subCode: LOGIN_CODES | undefined = undefined,
    message?: string
  ) {
    super(message || `Unauthorized with sub code ${subCode}`);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
