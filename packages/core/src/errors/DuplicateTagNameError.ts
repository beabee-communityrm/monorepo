import { ApiErrorCode, DuplicateTagNameErrorData } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

import { isDuplicateIndex } from '../utils/db';

export class DuplicateTagNameError
  extends BadRequestError
  implements DuplicateTagNameErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.DUPLICATE_TAG_NAME;

  constructor(readonly tagName: string) {
    super(`Tag with name "${tagName}" already exists`);
    Object.setPrototypeOf(this, DuplicateTagNameError.prototype);
  }

  static isPostgresError(error: any): boolean {
    return isDuplicateIndex(error, 'name');
  }
}
