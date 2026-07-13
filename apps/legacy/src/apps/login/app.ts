import ContactsService from '@beabee/core/services/ContactsService';
import { wrapAsync } from '@beabee/core/utils/express';
import { getNextParam, isValidNextUrl } from '@beabee/core/utils/url';

import express, { type Express, type Request, type Response } from 'express';

import { loginAndRedirect } from '#core/utils/contact';

const app: Express = express();

app.get('/', function (req: Request, res: Response) {
  const nextParam = typeof req.query.next === 'string' ? req.query.next : '';
  if (req.user) {
    res.redirect(isValidNextUrl(nextParam) ? nextParam : '/');
  } else {
    // Login is handled by the API's OIDC flow
    res.redirect('/api/1.0/auth/login' + getNextParam(nextParam));
  }
});

app.get(
  '/:code',
  wrapAsync<{ code: string }>(async function (req, res) {
    const nextParam = typeof req.query.next === 'string' ? req.query.next : '';
    const contact = await ContactsService.findByLoginOverride(req.params.code);
    if (contact) {
      await ContactsService.updateContact(contact, { loginOverride: null });
      loginAndRedirect(
        req,
        res,
        contact,
        isValidNextUrl(nextParam) ? nextParam : '/'
      );
    } else {
      req.flash('error', 'login-code-invalid');
      res.redirect('/login');
    }
  })
);

export default app;
