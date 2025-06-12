import { Contact } from '@beabee/core/models';

import { Request, Response } from 'express';

export function loginAndRedirect(
  req: Request,
  res: Response,
  contact: Contact,
  url?: string
): void {
  req.login(contact as Express.User, function (loginError) {
    if (loginError) {
      throw loginError;
    } else {
      res.redirect(url || '/');
    }
  });
}
