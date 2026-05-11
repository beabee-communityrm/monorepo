import { ApiErrorCode, NoPaymentMethodErrorData } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class NoPaymentMethodError
  extends BadRequestError
  implements NoPaymentMethodErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.NO_PAYMENT_METHOD;

  constructor() {
    super();
    Object.setPrototypeOf(this, NoPaymentMethodError.prototype);
  }
}
