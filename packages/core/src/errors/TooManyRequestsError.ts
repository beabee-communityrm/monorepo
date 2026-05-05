import type { TooManyRequestsErrorData } from '@beabee/beabee-common';
import { ApiErrorCode } from '@beabee/beabee-common';

import { HttpError } from 'routing-controllers';

/**
 * Custom error for HTTP 429 Too Many Requests responses.
 */
export class TooManyRequestsError
  extends HttpError
  implements TooManyRequestsErrorData
{
  readonly httpCode = 429 as const;
  readonly code = ApiErrorCode.TOO_MANY_REQUESTS;

  constructor(readonly retryAfter: number) {
    super(429, `Too many requests. Please retry after ${retryAfter} seconds.`);
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }
}
