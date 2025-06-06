import { runApp } from '@beabee/core/server';
import { getRepository } from '@beabee/core/database';
import { ContactRole } from '@beabee/core/models';
import { Between } from 'typeorm';
import { NewsletterStatus } from '@beabee/beabee-common';
import moment from 'moment';
import { newsletterService } from '@beabee/core/services/NewsletterService';
import { optionsService } from '@beabee/core/services/OptionsService';
import { log as mainLogger } from '@beabee/core/logging';

const log = mainLogger.child({ app: 'mailchimp-sync' });

interface SyncMailchimpArgs {
  startDate?: string;
  endDate?: string;
  dryRun: boolean;
}

export const syncMailchimp = async (args: SyncMailchimpArgs): Promise<void> => {
  await runApp(async () => {
    const actualStartDate = moment(args.startDate).toDate();
    const actualEndDate = moment(args.endDate).toDate();

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

    const contacts = memberships.map(({ contact }) => {
      const status = contact.membership?.isActive ? 'Update' : 'Remove';
      log.info(`${status} member status for ${contact.email}`);
      return contact;
    });

    const contactsToArchive = contacts.filter(
      (m) =>
        m.profile.newsletterStatus !== NewsletterStatus.None &&
        !m.membership?.isActive
    );

    const activeMemberTag = optionsService.getText(
      'newsletter-active-member-tag'
    );

    if (args.dryRun) {
      log.info('DRY RUN - Following actions would be performed:');
      log.info(`Total contacts processed: ${contacts.length}`);
      log.info(
        `Contacts that would lose active member tag: ${contactsToArchive.length}`
      );

      if (contactsToArchive.length > 0) {
        log.info('\nContacts that would be archived:');
        contactsToArchive.forEach((contact) => {
          log.info(
            `- ${contact.email} (Newsletter status: ${contact.profile.newsletterStatus})`
          );
        });
        log.info(`\nWould remove tag "${activeMemberTag}" from these contacts`);
      } else {
        log.info('No contacts need to be archived');
      }

      log.info('\nDRY RUN - No changes were made');
    } else {
      log.info(
        `Removing active member tag "${activeMemberTag}" from ${contactsToArchive.length} contacts`
      );
      await newsletterService.removeTagFromContacts(
        contactsToArchive,
        activeMemberTag
      );
      log.info('Sync completed successfully');
    }
  });
};
