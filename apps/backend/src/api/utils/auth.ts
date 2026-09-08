import { NotFoundError } from '@beabee/core/errors';
import { isOidcEnabled } from '@beabee/core/lib/oidc';
import { Contact } from '@beabee/core/models';

import { Request } from 'express';

/** Password, MFA and reset endpoints don't exist on OIDC Login instances */
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
