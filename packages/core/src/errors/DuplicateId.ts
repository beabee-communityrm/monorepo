import { BaseApiErrorData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class DuplicateId extends BadRequestError implements BaseApiErrorData {
  readonly code = 'duplicate-id';

  constructor(readonly id: string) {
    super();
    Object.setPrototypeOf(this, DuplicateId.prototype);
  }
}
