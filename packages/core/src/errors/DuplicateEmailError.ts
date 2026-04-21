import { ApiErrorCode, DuplicateEmailErrorData } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class DuplicateEmailError
  extends BadRequestError
  implements DuplicateEmailErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.DUPLICATE_EMAIL;

  constructor(readonly email: string) {
    super('Email already exists: ' + email);
    Object.setPrototypeOf(this, DuplicateEmailError.prototype);
  }
}
