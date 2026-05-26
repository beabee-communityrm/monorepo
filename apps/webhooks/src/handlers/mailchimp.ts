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

const knownWebhookTypes = [
  'subscribe',
  'unsubscribe',
  'profile',
  'upemail',
  'cleaned',
];

type MCWebhook =
  | MCProfileWebhook
  | MCUpdateEmailWebhook
  | MCCleanedEmailWebhook;

function isKnownWebhook(body: unknown): body is MCWebhook {
  return (
    typeof body === 'object' &&
    body !== null &&
    'type' in body &&
    typeof body.type === 'string' &&
    knownWebhookTypes.includes(body.type)
  );
}

/**
 * Endpoint that Mailchimp uses to check the webhook is valid. Don't check for
 * newsletter provider here as the webhook can be set before Mailchimp has been
 * enabled in beabee.
 */
mailchimpWebhookApp.get('/', (req: Request, res: Response) => {
  res.sendStatus(
    req.query.secret === config.newsletter.settings.webhookSecret ? 200 : 404
  );
});

/**
 * Middleware to verify Mailchimp webhook secret
 */
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

/**
 * Main Mailchimp webhook handler
 */
mailchimpWebhookApp.post(
  '/',
  wrapAsync(async (req: Request, res: Response) => {
    const body = req.body;

    // Ignore webhooks we don't know about
    if (!isKnownWebhook(body)) {
      return res.sendStatus(200);
    }

    log.info('Got webhook ' + body.type);

    // Send status early to avoid timeouts
    const status = await handleEarlyChecksAndGetStatus(body);
    res.sendStatus(status);

    await handleEvent(body);

    log.info(
      'Finished processing webhook ' + body.type + ' with status ' + status
    );
  })
);

/**
 * Check some early conditions for the webhook and return appropriate status code.
 * Only very fast checks should be done here (i.e. no dependency on external services).
 *
 * @param body The webhook body
 * @returns HTTP status code to return immediately
 */
async function handleEarlyChecksAndGetStatus(body: MCWebhook): Promise<number> {
  switch (body.type) {
    case 'upemail':
    case 'subscribe':
    case 'unsubscribe':
    case 'cleaned':
      return 200;

    case 'profile':
      const email = normalizeEmailAddress(body.data.email);
      const contact = await ContactsService.findOneBy({ email });
      // Make MailChimp resend the webhook if we don't find a contact
      // it's probably because the upemail and profile webhooks
      // arrived out of order
      return contact ? 200 : 404;
  }
}

/**
 * Handle the Mailchimp webhook event.

 * @param body The webhook body
 */
async function handleEvent(body: MCWebhook) {
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
      await handleUpdateProfile(body.data);
      break;
  }
}

/**
 * Handle updating a contact's email if it changes in Mailchimp
 *
 * @param data The update email data
 */
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

/**
 * Handle either adding a new subscriber or updating an existing one
 * when someone subscribes via Mailchimp
 *
 * @param data The profile data
 */
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

/**
 * Set a contact's newsletter status to unsubscribed when they unsubscribe via
 * Mailchimp
 *
 * @param data The profile data
 */
async function handleUnsubscribe(data: MCProfileData) {
  const email = normalizeEmailAddress(data.email);

  log.info('Unsubscribe ' + email);

  const contact = await ContactsService.findOneBy({ email });
  if (contact) {
    const nlContact = await NewsletterService.getNewsletterContact(email);
    await ContactsService.updateContactProfile(contact, {
      // Use the status from the newsletter system in case it has changed
      // since the webhook was sent
      newsletterStatus: nlContact?.status || NewsletterStatus.Unsubscribed,
    });
  }
}

/**
 * Set a contact's newsletter status to cleaned when their email is cleaned.
 *
 * @param data  The cleaned email data
 */
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

/**
 * Handle updating a contact's name and newsletter gruops when they changes in
 * Mailchimp. We are the source of truth for other data (e.g. our merge tags) so
 * these updates are not processed and instead we overwrite them in Mailchimp
 * when we update the contact profile
 *
 * @param data The profile data
 */
async function handleUpdateProfile(data: MCProfileData) {
  const email = normalizeEmailAddress(data.email);

  log.info('Update profile for ' + email);

  const contact = await ContactsService.findOneBy({ email });
  if (contact) {
    const nlContact = await NewsletterService.getNewsletterContact(email);
    await ContactsService.updateContact(contact, {
      firstname: data.merges.FNAME || contact.firstname,
      lastname: data.merges.LNAME || contact.lastname,
    });
    // This will also overwrite any other changes made to merge tags
    await ContactsService.updateContactProfile(contact, {
      newsletterGroups: nlContact?.groups || [],
    });
  } else {
    log.info('Contact not found for ' + email);
  }
}

export { mailchimpWebhookApp };
