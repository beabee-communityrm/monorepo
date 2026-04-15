import { UnsupportedFileTypeErrorData } from '@beabee/beabee-common';

import { HttpError } from 'routing-controllers';

/**
 * Custom error for HTTP 415 Unsupported File Type responses.
 */
export class UnsupportedFileType
  extends HttpError
  implements UnsupportedFileTypeErrorData
{
  httpCode = 415 as const;
  code = 'unsupported-file-type' as const;

  constructor(readonly allowedTypes: string[]) {
    super(415);
    Object.setPrototypeOf(this, UnsupportedFileType.prototype);
  }
}
