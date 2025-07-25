import { Address } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { GiftFlow, GiftForm } from '@beabee/core/models';
import ContactsService from '@beabee/core/services/ContactsService';
import GiftService from '@beabee/core/services/GiftService';
import OptionsService from '@beabee/core/services/OptionsService';
import { wrapAsync } from '@beabee/core/utils/express';

import express, { type Express } from 'express';
import moment from 'moment';

import { hasNewModel, hasSchema } from '#core/middleware';
import { loginAndRedirect } from '#core/utils/contact';

import { createGiftSchema, updateGiftAddressSchema } from './schema.json';

const app: Express = express();

interface CreateGiftSchema {
  firstname: string;
  lastname: string;
  email: string;
  startDate: string;
  message?: string;
  fromName: string;
  fromEmail: string;
  months: number;
}

interface AddressSchema {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
}

type UpdateGiftAddressSchema =
  | {
      sameAddress: true;
      giftAddress: AddressSchema;
    }
  | {
      sameAddress: false;
      giftAddress: AddressSchema;
      deliveryAddress: AddressSchema;
    };

function schemaToGiftForm(data: CreateGiftSchema): GiftForm {
  const giftForm = new GiftForm();
  giftForm.firstname = data.firstname;
  giftForm.lastname = data.lastname;
  giftForm.email = data.email;
  giftForm.startDate = moment.utc(data.startDate).toDate();
  giftForm.message = data.message || null;
  giftForm.fromName = data.fromName;
  giftForm.fromEmail = data.fromEmail;
  giftForm.months = data.months;
  return giftForm;
}

function schemaToAddress(data: AddressSchema): Address {
  return data;
}

function schemaToAddresses(data: UpdateGiftAddressSchema): {
  giftAddress: Address;
  deliveryAddress: Address;
} {
  const giftAddress = schemaToAddress(data.giftAddress);
  const deliveryAddress = data.sameAddress
    ? schemaToAddress(data.giftAddress)
    : schemaToAddress(data.deliveryAddress);
  return { giftAddress, deliveryAddress };
}

app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
  res.render('index', { stripePublicKey: config.stripe.publicKey });
});

app.post(
  '/',
  hasSchema(createGiftSchema).orReplyWithJSON,
  wrapAsync(async (req, res) => {
    let error;
    const giftForm = schemaToGiftForm(req.body);

    if (moment(giftForm.startDate).isBefore(undefined, 'day')) {
      error = 'flash-gifts-date-in-the-past' as const;
    } else {
      const contact = await ContactsService.findOneBy({
        email: giftForm.email,
      });
      if (contact) {
        error = 'flash-gifts-email-duplicate' as const;
      }
    }

    if (error) {
      res.status(400).send([OptionsService.getText(error)]);
    } else {
      const sessionId = await GiftService.createGiftFlow(giftForm);
      res.send({ sessionId });
    }
  })
);

app.get(
  '/:setupCode',
  hasNewModel(GiftFlow, 'setupCode', { relations: { giftee: true } }),
  wrapAsync(async (req, res, next) => {
    const giftFlow = req.model as GiftFlow;

    if (giftFlow.completed) {
      if (!giftFlow.processed) {
        await GiftService.processGiftFlow(giftFlow, true);
      }

      if (giftFlow.giftee) {
        // Effectively expire this link once the contact is set up
        if (giftFlow.giftee.setupComplete) {
          req.flash('warning', 'gifts-already-activated');
          res.redirect('/login');
        } else {
          loginAndRedirect(req, res, giftFlow.giftee, '/profile/complete');
        }
      } else {
        next('route');
      }
    } else {
      res.redirect('/gift/failed/' + giftFlow.id);
    }
  })
);

app.get('/thanks/:id', hasNewModel(GiftFlow, 'id'), (req, res) => {
  const giftFlow = req.model as GiftFlow;
  if (giftFlow.completed) {
    res.render('thanks', {
      ...giftFlow.giftForm,
      processed: giftFlow.processed,
    });
  } else {
    res.redirect('/gift/failed/' + giftFlow.id);
  }
});

app.post(
  '/thanks/:id',
  [hasNewModel(GiftFlow, 'id'), hasSchema(updateGiftAddressSchema).orFlash],
  wrapAsync(async (req, res) => {
    const giftFlow = req.model as GiftFlow;
    const { giftAddress, deliveryAddress } = schemaToAddresses(req.body);
    await GiftService.updateGiftFlowAddress(
      giftFlow,
      giftAddress,
      deliveryAddress
    );

    res.redirect(req.originalUrl);
  })
);

app.get('/failed/:id', hasNewModel(GiftFlow, 'id'), (req, res) => {
  const giftFlow = req.model as GiftFlow;
  if (giftFlow.completed) {
    res.redirect('/gift/thanks/' + giftFlow.id);
  } else {
    res.render('failed', { id: giftFlow.id });
  }
});

export default app;
