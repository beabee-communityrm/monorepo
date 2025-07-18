import { DuplicateEmailError } from '@beabee/core/errors';
import { Contact } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';
import { wrapAsync } from '@beabee/core/utils/express';

import express, { type Express, type Request, type Response } from 'express';

import { hasSchema } from '#core/middleware';

import { updateProfileSchema } from './schemas.json';

const app: Express = express();

app.set('views', __dirname + '/views');

app.get('/', (req: Request, res: Response) => {
  res.render('index', { member: req.model });
});

app.post(
  '/',
  [hasSchema(updateProfileSchema).orFlash],
  wrapAsync(async (req: Request, res: Response) => {
    const {
      body: {
        email,
        firstname,
        lastname,
        delivery_optin,
        delivery_line1,
        delivery_line2,
        delivery_city,
        delivery_postcode,
      },
    } = req;
    const contact = req.model as Contact;

    try {
      await ContactsService.updateContact(contact, {
        email,
        firstname,
        lastname,
      });
      await ContactsService.updateContactProfile(contact, {
        deliveryOptIn: delivery_optin,
        deliveryAddress: delivery_optin
          ? {
              line1: delivery_line1,
              line2: delivery_line2,
              city: delivery_city,
              postcode: delivery_postcode,
            }
          : null,
      });
    } catch (error) {
      if (error instanceof DuplicateEmailError) {
        req.flash('danger', 'email-duplicate');
      } else {
        throw error;
      }
    }

    res.redirect(req.originalUrl);
  })
);

export default app;
