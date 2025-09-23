import { RoleType, RoleTypes } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { getRepository } from '@beabee/core/database';
import { ContactRole } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';
import { wrapAsync } from '@beabee/core/utils/express';
import { getNextParam, isValidNextUrl } from '@beabee/core/utils/url';

import express, { type Express, type Request, type Response } from 'express';
import passport from 'passport';

import { loginAndRedirect } from '#core/utils/contact';

const app: Express = express();

app.set('views', __dirname + '/views');

app.get('/', function (req: Request, res: Response) {
  const nextParam = req.query.next as string;
  if (req.user) {
    res.redirect(isValidNextUrl(nextParam) ? nextParam : '/');
  } else {
    res.render('index', { nextParam: getNextParam(nextParam) });
  }
});

// Legacy version of login/as/:id
if (config.dev) {
  app.get(
    '/as/:id',
    wrapAsync(async (req, res) => {
      let contact;
      if (RoleTypes.indexOf(req.params.id as RoleType) > -1) {
        const role = await getRepository(ContactRole).findOne({
          where: {
            type: req.params.id as RoleType,
          },
          relations: { contact: true },
        });
        contact = role?.contact;
      } else {
        contact = await ContactsService.findOneBy({ id: req.params.id });
      }

      if (contact) {
        loginAndRedirect(req, res, contact);
      } else {
        res.redirect('/login');
      }
    })
  );
}

app.get(
  '/:code',
  wrapAsync(async function (req, res) {
    const nextParam = req.query.next as string;
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

app.post('/', (req, res) => {
  const nextParam = req.query.next as string;
  passport.authenticate('local', {
    failureRedirect: '/login' + getNextParam(nextParam),
    failureFlash: true,
  })(req, res, () => {
    req.session.method = 'plain';
    res.redirect(isValidNextUrl(nextParam) ? nextParam : '/');
  });
});

export default app;
