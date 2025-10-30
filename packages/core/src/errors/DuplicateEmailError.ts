import { ClientApiErrorData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class DuplicateEmailError
  extends BadRequestError
  implements ClientApiErrorData
{
  readonly code = 'duplicate-email';

  constructor() {
    super();
    Object.setPrototypeOf(this, DuplicateEmailError.prototype);
  }
}
