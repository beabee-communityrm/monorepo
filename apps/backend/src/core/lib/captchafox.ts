import config from '@beabee/core/config';

import { verify as cfVerify } from '@captchafox/node';

export async function verify(token: string): Promise<string> {
  const resp = await cfVerify(config.captchaFox.secret, token);
  if (resp.success) {
    return '';
  } else {
    const errorCodes = resp['error-codes'];
    return errorCodes ? errorCodes.join(', ') : 'unknown';
  }
}
