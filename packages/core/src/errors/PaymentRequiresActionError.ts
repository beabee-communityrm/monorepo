import { ClientApiErrorData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class PaymentRequiresActionError
  extends BadRequestError
  implements ClientApiErrorData
{
  readonly code = 'payment-requires-action';

  constructor(public readonly clientSecret: string) {
    super();
    Object.setPrototypeOf(this, PaymentRequiresActionError.prototype);
  }
}
