import { ClientApiErrorData } from '@beabee/beabee-common';

import { HttpError } from 'routing-controllers';

/**
 * Custom error for HTTP 415 Unsupported File Type responses.
 */
export class UnsupportedFileType
  extends HttpError
  implements ClientApiErrorData
{
  httpCode = 415;
  code = 'UNSUPPORTED_FILE_TYPE';
  constructor(options: { message?: string } = {}) {
    super(415, options.message || 'Unsupported File Type');
    Object.setPrototypeOf(this, UnsupportedFileType.prototype);
    this.name = 'UnsupportedFileType';
  }
}
