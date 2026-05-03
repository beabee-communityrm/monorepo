import {
  ApiErrorCode,
  PaymentRequiresActionErrorData,
} from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class PaymentRequiresActionError
  extends BadRequestError
  implements PaymentRequiresActionErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.PAYMENT_REQUIRES_ACTION;

  constructor(public readonly clientSecret: string) {
    super(`Payment requires additional action`);
    Object.setPrototypeOf(this, PaymentRequiresActionError.prototype);
  }
}
