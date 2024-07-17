import { Request } from "express";
import { createParamDecorator } from "routing-controllers";

import { UnauthorizedError } from "@beabee/core/errors";

import { AuthInfo } from "@type/auth-info";

export function CurrentAuth(options?: { required?: boolean }) {
  return createParamDecorator({
    value: (action: { request: Request }): AuthInfo | undefined => {
      if (options?.required && !action.request.auth) {
        throw new UnauthorizedError();
      }
      return action.request.auth;
    }
  });
}
