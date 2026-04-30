import { ApiErrorCode, BadRequestErrorData } from '@beabee/beabee-common';

import { BadRequestError as _BadRequestError } from 'routing-controllers';

export class BadRequestError
  extends _BadRequestError
  implements BadRequestErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.BAD_REQUEST;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
