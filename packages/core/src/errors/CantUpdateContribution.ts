import { BaseApiErrorData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class CantUpdateContribution
  extends BadRequestError
  implements BaseApiErrorData
{
  readonly code = 'cant-update-contribution';

  constructor() {
    super();
    Object.setPrototypeOf(this, CantUpdateContribution.prototype);
  }
}
