import {
  ApiErrorCode,
  InvalidCalloutResponseCode,
  InvalidCalloutResponseErrorData,
} from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class InvalidCalloutResponseError
  extends BadRequestError
  implements InvalidCalloutResponseErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.INVALID_CALLOUT_RESPONSE;

  constructor(readonly subCode: InvalidCalloutResponseCode) {
    super(`Invalid callout response: ${subCode}`);
    Object.setPrototypeOf(this, InvalidCalloutResponseError.prototype);
  }
}
