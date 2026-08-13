import { isOidcEnabled } from '@beabee/core/lib/oidc';
import { wrapAsync } from '@beabee/core/utils/express';

import express, { type Express, type Request, type Response } from 'express';

const app: Express = express();

app.get(
  '/',
  wrapAsync(async function (req: Request, res: Response) {
    if (isOidcEnabled()) {
      // The API's logout flow also ends the identity provider session
      return res.redirect('/api/1.0/auth/logout');
    }
    delete req.session.method;
    await new Promise<void>((resolve) => req.logout(resolve));
    req.flash('success', 'logged-out');
    res.redirect('/');
  })
);

export default app;
