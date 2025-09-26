import { ClientApiErrorData } from '@beabee/beabee-common';

import { BadRequestError } from './BadRequestError';

export class ExternalEmailTemplate
  extends BadRequestError
  implements ClientApiErrorData
{
  readonly code = 'external-email-template';
  constructor() {
    super();
    Object.setPrototypeOf(this, ExternalEmailTemplate.prototype);
  }
}
