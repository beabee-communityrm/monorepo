import { ApiErrorCode, InternalServerErrorData } from '@beabee/beabee-common';

import { InternalServerError as _InternalServerError } from 'routing-controllers';

export class InternalServerError
  extends _InternalServerError
  implements InternalServerErrorData
{
  readonly httpCode = 500;
  readonly code = ApiErrorCode.INTERNAL_SERVER_ERROR;

  constructor(message?: string) {
    super(message || 'Internal Server Error');
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
