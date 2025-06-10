import 'module-alias/register';

import { NewsletterStatus } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { Contact, ContactRole } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import NewsletterService from '@beabee/core/services/NewsletterService';
import OptionsService from '@beabee/core/services/OptionsService';

import moment from 'moment';
import { Between } from 'typeorm';

const log = mainLogger.child({ app: 'mailchimp-sync' });

async function fetchContacts(
  startDate: string | undefined,
  endDate: string | undefined
): Promise<Contact[]> {
  const actualStartDate = startDate
    ? moment(startDate).toDate()
    : moment().subtract({ d: 1, h: 2 }).toDate();
  const actualEndDate = moment(endDate).toDate();

  log.info('Fetching contacts', {
    startDate: actualStartDate,
    endDate: actualEndDate,
  });

  const memberships = await getRepository(ContactRole).find({
    where: {
      type: 'member',
      dateExpires: Between(actualStartDate, actualEndDate),
    },
    relations: { contact: { profile: true } },
  });
  log.info(`Got ${memberships.length} members`);
  return memberships.map(({ contact }) => {
    log.info(contact.membership?.isActive ? 'U' : 'D', contact.email);
    return contact;
  });
}

/**
 * @deprecated This tool is deprecated and will be removed in the next major version.
 * Please use the new backend-cli sync mailchimp command instead: yarn backend-cli sync mailchimp
 */
async function processContacts(contacts: Contact[]) {
  const contactsToArchive = contacts.filter(
    (m) =>
      m.profile.newsletterStatus !== NewsletterStatus.None &&
      !m.membership?.isActive
  );

  log.info(
    `Removing active member tag from ${contactsToArchive.length} contacts`
  );
  await NewsletterService.removeTagFromContacts(
    contactsToArchive,
    OptionsService.getText('newsletter-active-member-tag')
  );
}

runApp(async () => {
  console.warn(
    '\n⚠️  DEPRECATED: This mailchimp sync tool is deprecated and will be removed in the next major version.\n' +
      'Please use the new backend-cli sync mailchimp command instead: yarn backend-cli sync mailchimp\n'
  );

  const isTest = process.argv[2] === '-n';
  const [startDate, endDate] = process.argv.slice(isTest ? 3 : 2);
  const contacts = await fetchContacts(startDate, endDate);
  if (!isTest) {
    await processContacts(contacts);
  }
});
