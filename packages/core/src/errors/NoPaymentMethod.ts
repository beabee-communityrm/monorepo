import { BadRequestError } from 'routing-controllers';

export class NoPaymentMethod extends BadRequestError {
  readonly code = 'no-payment-method';

  constructor() {
    super();
    Object.setPrototypeOf(this, NoPaymentMethod.prototype);
  }
}
