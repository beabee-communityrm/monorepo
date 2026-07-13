import {
  ApiErrorCode,
  CantUpdateNewsletterGroupsErrorData,
} from '@beabee/beabee-common';

import { InternalServerError } from 'routing-controllers';

export class CantUpdateNewsletterGroupsError
  extends InternalServerError
  implements CantUpdateNewsletterGroupsErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.CANT_UPDATE_NEWSLETTER_GROUPS;

  constructor(readonly detail: string) {
    super("Can't update newsletter groups");
    Object.setPrototypeOf(this, CantUpdateNewsletterGroupsError.prototype);
  }
}
