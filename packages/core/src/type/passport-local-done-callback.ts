import type { Contact } from '@beabee/core/models';
import type { HttpError } from 'routing-controllers';
import type { UnauthorizedError } from '@beabee/core/errors';
import type { PassportLocalVerifyOptions } from './passport-local-verify-options';

export type PassportLocalDoneCallback = (
  error: null | HttpError | UnauthorizedError,
  user: Contact | false,
  options?: PassportLocalVerifyOptions | undefined
) => void;
