import type { FileUploadErrorData } from '@beabee/beabee-common';
import { ApiErrorCode } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class FileUploadError
  extends BadRequestError
  implements FileUploadErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.FILE_UPLOAD_ERROR;

  constructor(
    readonly subCode: string,
    message?: string
  ) {
    super(message || `File upload error: ${subCode}`);
    Object.setPrototypeOf(this, FileUploadError.prototype);
  }
}
