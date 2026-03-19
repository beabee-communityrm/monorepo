import { ClientApiErrorData } from '@beabee/beabee-common';

import { HttpError } from 'routing-controllers';

/**
 * Custom error for HTTP 413 Payload Too Large responses.
 */
export class FileTooLargeError extends HttpError implements ClientApiErrorData {
  httpCode = 413;
  code = 'FILE_TOO_LARGE';

  constructor(
    options: {
      message?: string;
      maxSize?: string;
    } = {}
  ) {
    const message =
      options.message ||
      (options.maxSize
        ? `File too large (max ${options.maxSize})`
        : 'File too large');

    super(413, message);
    Object.setPrototypeOf(this, FileTooLargeError.prototype);
    this.name = 'FileTooLargeError';
  }
}
