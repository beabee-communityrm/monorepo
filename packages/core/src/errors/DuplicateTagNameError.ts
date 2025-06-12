import { BadRequestError } from 'routing-controllers';

import { isDuplicateIndex } from '../utils/db';

export class DuplicateTagNameError extends BadRequestError {
  readonly code = 'duplicate-tag-name';

  constructor(tagName: string) {
    super(`Tag with name "${tagName}" already exists`);
    Object.setPrototypeOf(this, DuplicateTagNameError.prototype);
  }

  static isPostgresError(error: any): boolean {
    return isDuplicateIndex(error, 'name');
  }
}
