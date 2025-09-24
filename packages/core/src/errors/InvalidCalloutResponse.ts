import { ClientApiErrorData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

type InvalidCalloutResponseCode =
  | 'only-anonymous'
  | 'expired-user'
  | 'closed'
  | 'cant-update'
  | 'guest-fields-missing'
  | 'logged-in-guest-fields'
  | 'unknown-user';

export class InvalidCalloutResponse
  extends BadRequestError
  implements ClientApiErrorData
{
  readonly code = 'invalid-callout-response';
  constructor(readonly subCode: InvalidCalloutResponseCode) {
    super();
    Object.setPrototypeOf(this, InvalidCalloutResponse.prototype);
  }
}
