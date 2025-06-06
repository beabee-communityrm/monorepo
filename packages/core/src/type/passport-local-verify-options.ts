import { LOGIN_CODES } from '@beabee/beabee-common';
import type { IVerifyOptions } from 'passport-local';

export type PassportLocalVerifyOptions = IVerifyOptions & {
  message: LOGIN_CODES | string;
};
