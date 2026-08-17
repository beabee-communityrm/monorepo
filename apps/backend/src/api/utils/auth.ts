import { NotFoundError } from '@beabee/core/errors';
import { isOidcEnabled } from '@beabee/core/lib/oidc';
import { Contact } from '@beabee/core/models';

import { Request } from 'express';

/** Password and MFA endpoints don't exist on instances that use OIDC login */
export function assertPasswordAuthEnabled(): void {
  if (isOidcEnabled()) {
    throw new NotFoundError();
  }
}

export function login(req: Request, contact: Contact): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    req.login(contact, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
