import { UnauthorizedErrorData } from '@beabee/beabee-common';

import { UnauthorizedError as _UnauthorizedError } from 'routing-controllers';

/**
 * UnauthorizedError with optional code
 */
export class UnauthorizedError
  extends _UnauthorizedError
  implements UnauthorizedErrorData
{
  httpCode = 401 as const;
  code = 'unauthorized' as const;

  constructor(readonly subCode: string | undefined = undefined) {
    super();
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
