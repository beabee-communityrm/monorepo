import {
  ApiErrorCode,
  CantUpdateContributionErrorData,
} from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class CantUpdateContributionError
  extends BadRequestError
  implements CantUpdateContributionErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.CANT_UPDATE_CONTRIBUTION;

  constructor() {
    super("Can't update contribution");
    Object.setPrototypeOf(this, CantUpdateContributionError.prototype);
  }
}
