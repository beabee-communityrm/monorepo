import type { CaptchaFailedErrorData } from '@beabee/beabee-common';
import { ApiErrorCode } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class CaptchaFailedError
  extends BadRequestError
  implements CaptchaFailedErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.CAPTCHA_FAILED;

  constructor() {
    super('Captcha verification failed');
    Object.setPrototypeOf(this, CaptchaFailedError.prototype);
  }
}
