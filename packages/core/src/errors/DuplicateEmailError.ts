import { BaseApiErrorData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class DuplicateEmailError
  extends BadRequestError
  implements BaseApiErrorData
{
  readonly code = 'duplicate-email';

  constructor() {
    super();
    Object.setPrototypeOf(this, DuplicateEmailError.prototype);
  }
}
