import { PaymentFailedData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class PaymentFailed
  extends BadRequestError
  implements PaymentFailedData
{
  readonly code = 'payment-failed' as const;
  httpCode = 400;

  constructor(
    readonly subCode: string,
    message: string = 'Payment Failed'
  ) {
    super({ message, code: 'payment-failed' });
    Object.setPrototypeOf(this, PaymentFailed.prototype);
  }
}
