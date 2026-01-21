import { ClientApiErrorData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class PaymentFailed
  extends BadRequestError
  implements ClientApiErrorData
{
  readonly code = 'payment-failed';

  constructor(readonly subCode: string) {
    super();
    Object.setPrototypeOf(this, PaymentFailed.prototype);
  }
}
