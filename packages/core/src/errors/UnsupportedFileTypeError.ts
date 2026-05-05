import type { UnsupportedFileTypeErrorData } from '@beabee/beabee-common';
import { ApiErrorCode } from '@beabee/beabee-common';

import { HttpError } from 'routing-controllers';

/**
 * Custom error for HTTP 415 Unsupported File Type responses.
 */
export class UnsupportedFileTypeError
  extends HttpError
  implements UnsupportedFileTypeErrorData
{
  readonly httpCode = 415;
  readonly code = ApiErrorCode.UNSUPPORTED_FILE_TYPE;

  constructor(
    readonly type: string,
    readonly allowedTypes: string[] | undefined = undefined
  ) {
    super(
      415,
      `Unsupported file type ${type}${allowedTypes ? ` (allowed: ${allowedTypes.join(', ')})` : ''}`
    );
    Object.setPrototypeOf(this, UnsupportedFileTypeError.prototype);
  }
}
