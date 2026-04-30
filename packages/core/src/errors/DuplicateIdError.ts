import { ApiErrorCode, DuplicateIdErrorData } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class DuplicateIdError
  extends BadRequestError
  implements DuplicateIdErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.DUPLICATE_ID;

  constructor(readonly id: string) {
    super('Duplicate ID: ' + id);
    Object.setPrototypeOf(this, DuplicateIdError.prototype);
  }
}
