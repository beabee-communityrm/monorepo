import { ApiErrorCode, PaymentFailedErrorData } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class PaymentFailedError
  extends BadRequestError
  implements PaymentFailedErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.PAYMENT_FAILED;

  constructor(readonly subCode: string) {
    super(`Payment failed with code ${subCode}`);
    Object.setPrototypeOf(this, PaymentFailedError.prototype);
  }
}
