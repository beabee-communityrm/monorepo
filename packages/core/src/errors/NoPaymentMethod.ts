import { ClientApiErrorData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class NoPaymentMethod
  extends BadRequestError
  implements ClientApiErrorData
{
  readonly code = 'no-payment-method';

  constructor() {
    super();
    Object.setPrototypeOf(this, NoPaymentMethod.prototype);
  }
}
