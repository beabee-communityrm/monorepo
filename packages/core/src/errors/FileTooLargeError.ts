import {
  ApiErrorCode,
  FileTooLargeErrorData,
  bytesToHumanReadable,
} from '@beabee/beabee-common';

import { HttpError } from 'routing-controllers';

/**
 * Custom error for HTTP 413 Payload Too Large responses.
 */
export class FileTooLargeError
  extends HttpError
  implements FileTooLargeErrorData
{
  readonly httpCode = 413;
  readonly code = ApiErrorCode.FILE_TOO_LARGE;
  readonly maxSizeDisplay: string | undefined;

  constructor(
    readonly maxSize: number | undefined,
    message?: string
  ) {
    const maxSizeDisplay =
      maxSize !== undefined ? bytesToHumanReadable(maxSize) : undefined;

    super(
      413,
      message ||
        (maxSizeDisplay
          ? `File too large (max ${maxSizeDisplay} bytes)`
          : 'File too large')
    );

    this.maxSizeDisplay = maxSizeDisplay;

    Object.setPrototypeOf(this, FileTooLargeError.prototype);
  }
}
