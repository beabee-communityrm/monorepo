import type { CaptchaRequiredErrorData } from '@beabee/beabee-common';
import { ApiErrorCode } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class CaptchaRequiredError
  extends BadRequestError
  implements CaptchaRequiredErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.CAPTCHA_REQUIRED;

  constructor() {
    super('Captcha is required');
    Object.setPrototypeOf(this, CaptchaRequiredError.prototype);
  }
}
