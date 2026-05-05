import type {
  RESET_SECURITY_FLOW_ERROR_CODE,
  ResetSecurityFlowErrorData,
} from '@beabee/beabee-common';
import { ApiErrorCode } from '@beabee/beabee-common';

import { BadRequestError } from 'routing-controllers';

export class ResetSecurityFlowError
  extends BadRequestError
  implements ResetSecurityFlowErrorData
{
  readonly httpCode = 400;
  readonly code = ApiErrorCode.RESET_SECURITY_FLOW_ERROR;

  constructor(
    readonly subCode: RESET_SECURITY_FLOW_ERROR_CODE,
    message?: string
  ) {
    super(message || `Reset security flow error: ${subCode}`);
    Object.setPrototypeOf(this, ResetSecurityFlowError.prototype);
  }
}
