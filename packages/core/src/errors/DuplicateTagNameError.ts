import { ClientApiErrorData } from '@beabee/beabee-common';

import { isDuplicateIndex } from '../utils/db';
import { BadRequestError } from './BadRequestError';

export class DuplicateTagNameError
  extends BadRequestError
  implements ClientApiErrorData
{
  readonly code = 'duplicate-tag-name';

  constructor(tagName: string) {
    super({ message: `Tag with name "${tagName}" already exists` });
    Object.setPrototypeOf(this, DuplicateTagNameError.prototype);
  }

  static isPostgresError(error: any): boolean {
    return isDuplicateIndex(error, 'name');
  }
}
