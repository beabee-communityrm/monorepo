import type { CantUpdateNewsletterContactErrorData } from '@beabee/beabee-common';
import { ApiErrorCode } from '@beabee/beabee-common';

import { InternalServerError } from 'routing-controllers';

export class CantUpdateNewsletterContactError
  extends InternalServerError
  implements CantUpdateNewsletterContactErrorData
{
  readonly httpCode = 500;
  readonly code = ApiErrorCode.CANT_UPDATE_NEWSLETTER_CONTACT;

  constructor(
    readonly email: string,
    readonly status: number,
    readonly data: any
  ) {
    super("Can't update newsletter contact " + email);
    Object.setPrototypeOf(this, CantUpdateNewsletterContactError.prototype);
  }
}
