import { ContributionType, NewsletterStatus } from '@beabee/beabee-common';
import config from '@beabee/core/config';
import { log as mainLogger } from '@beabee/core/logging';
import ContactsService from '@beabee/core/services/ContactsService';
import NewsletterService from '@beabee/core/services/NewsletterService';
import { normalizeEmailAddress } from '@beabee/core/utils/email';
import { wrapAsync } from '@beabee/core/utils/express';

import bodyParser from 'body-parser';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

const log = mainLogger.child({ app: 'webhook-mailchimp' });

const mailchimpWebhookApp: Express = express();

interface MCProfileData {
  email: string;
  merges: {
    [key: string]: string | undefined;
  };
}

interface MCUpdateEmailData {
  new_email: string;
  old_email: string;
}

interface MCCleanedEmailData {
  email: string;
}

interface MCProfileWebhook {
  type: 'subscribe' | 'unsubscribe' | 'profile';
  data: MCProfileData;
}

interface MCUpdateEmailWebhook {
  type: 'upemail';
  data: MCUpdateEmailData;
}

interface MCCleanedEmailWebhook {
  type: 'cleaned';
  data: MCCleanedEmailData;
}

type MCWebhook =
  | MCProfileWebhook
  | MCUpdateEmailWebhook
  | MCCleanedEmailWebhook;

// Mailchimp pings this endpoint when you first add the webhook
// Don't check for newsletter provider here as the webhook can be set
// before Mailchimp has been enabled
mailchimpWebhookApp.get('/', (req: Request, res: Response) => {
  res.sendStatus(
    req.query.secret === config.newsletter.settings.webhookSecret ? 200 : 404
  );
});

mailchimpWebhookApp.use((req: Request, res: Response, next: NextFunction) => {
  if (
    config.newsletter.provider === 'mailchimp' &&
    req.query['secret'] === config.newsletter.settings.webhookSecret
  ) {
    next();
  } else {
    res.sendStatus(404);
  }
});

mailchimpWebhookApp.use(bodyParser.json());
mailchimpWebhookApp.use(bodyParser.urlencoded({ extended: true }));

mailchimpWebhookApp.post(
  '/',
  wrapAsync(async (req: Request, res: Response) => {
    const body = req.body as MCWebhook;

    log.info('Got webhook ' + body.type);

    switch (body.type) {
      case 'upemail':
        await handleUpdateEmail(body.data);
        break;

      case 'subscribe':
        await handleSubscribe(body.data);
        break;

      case 'unsubscribe':
        await handleUnsubscribe(body.data);
        break;

      case 'cleaned':
        await handleCleaned(body.data);
        break;

      case 'profile':
        // Make MailChimp resend the webhook if we don't find a contact
        // it's probably because the upemail and profile webhooks
        // arrived out of order
        // TODO: add checks for repeated failure
        if (!(await handleUpdateProfile(body.data))) {
          return res.sendStatus(404);
        }
        break;
    }

    res.sendStatus(200);
  })
);

async function handleUpdateEmail(data: MCUpdateEmailData) {
  const oldEmail = normalizeEmailAddress(data.old_email);
  const newEmail = normalizeEmailAddress(data.new_email);

  log.info(`Update email from ${oldEmail} to ${newEmail}`);

  const contact = await ContactsService.findOneBy({ email: oldEmail });
  if (contact) {
    await ContactsService.updateContact(
      contact,
      { email: newEmail },
      // Don't try to sync to old email address
      { sync: false }
    );
  } else {
    log.error('Old email not found in Mailchimp update email hook', data);
  }
}

async function handleSubscribe(data: MCProfileData) {
  const email = normalizeEmailAddress(data.email);

  log.info({
    action: 'subscribe',
    data: { email },
  });

  const contact = await ContactsService.findOneBy({ email });
  if (contact) {
    await ContactsService.updateContactProfile(contact, {
      newsletterStatus: NewsletterStatus.Subscribed,
    });
  } else {
    const nlContact = await NewsletterService.getNewsletterContact(email);
    await ContactsService.createContact(
      {
        email,
        contributionType: ContributionType.None,
        firstname: data.merges.FNAME || '',
        lastname: data.merges.LNAME || '',
      },
      {
        newsletterStatus: NewsletterStatus.Subscribed,
        newsletterGroups: nlContact?.groups || [],
      }
    );
  }
}

async function handleUnsubscribe(data: MCProfileData) {
  const email = normalizeEmailAddress(data.email);

  log.info('Unsubscribe ' + email);

  const contact = await ContactsService.findOneBy({ email });
  if (contact) {
    const nlContact = await NewsletterService.getNewsletterContact(email);
    await ContactsService.updateContactProfile(contact, {
      newsletterStatus: nlContact?.status || NewsletterStatus.Unsubscribed,
    });
  }
}

async function handleCleaned(data: MCCleanedEmailData) {
  const email = normalizeEmailAddress(data.email);

  log.info('Cleaned ' + email);

  const contact = await ContactsService.findOneBy({ email });
  if (contact) {
    await ContactsService.updateContactProfile(contact, {
      newsletterStatus: NewsletterStatus.Cleaned,
    });
  }
}

async function handleUpdateProfile(data: MCProfileData): Promise<boolean> {
  const email = normalizeEmailAddress(data.email);

  log.info('Update profile for ' + email);

  const contact = await ContactsService.findOneBy({ email });
  if (contact) {
    const nlContact = await NewsletterService.getNewsletterContact(email);
    await ContactsService.updateContact(contact, {
      firstname: data.merges.FNAME || contact.firstname,
      lastname: data.merges.LNAME || contact.lastname,
    });
    await ContactsService.updateContactProfile(contact, {
      newsletterGroups: nlContact?.groups || [],
    });
    return true;
  } else {
    log.info('Contact not found for ' + email);
    return false;
  }
}

export { mailchimpWebhookApp };
