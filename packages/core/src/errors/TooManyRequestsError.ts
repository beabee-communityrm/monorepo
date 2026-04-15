import { TooManyRequestsErrorData } from '@beabee/beabee-common';

import { HttpError } from 'routing-controllers';

/**
 * Custom error for HTTP 429 Too Many Requests responses.
 */
export class TooManyRequestsError
  extends HttpError
  implements TooManyRequestsErrorData
{
  httpCode = 429 as const;
  code = 'too-many-requests' as const;

  constructor(
    readonly retryAfter: number,
    message: string = 'Too Many Requests'
  ) {
    super(429, message);
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}
