import { Request } from 'express';
import { createParamDecorator } from 'routing-controllers';

import { UnauthorizedError } from '@beabee/core/errors';

import { AuthInfo } from '@beabee/core/type';

export function CurrentAuth(options?: { required?: boolean }) {
  return createParamDecorator({
    value: (action: { request: Request }): AuthInfo => {
      if (options?.required && action.request.auth.method === 'none') {
        throw new UnauthorizedError();
      }
      return action.request.auth;
    },
  });
}
