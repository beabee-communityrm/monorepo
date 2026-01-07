import { NewsletterStatus } from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { ContactRole } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { newsletterBulkService, optionsService } from '@beabee/core/services';

import { Between } from 'typeorm';

import { SyncNewsletterActiveMemberTagArgs } from '../../../types/sync.js';

const log = mainLogger.child({ app: 'sync-newsletter-active-member-tag' });

export const syncActiveMemberTag = async (
  args: SyncNewsletterActiveMemberTagArgs
): Promise<void> => {
  await runApp(async () => {
    log.info('Fetching contacts', { since: args.since, until: args.until });

    const memberships = await getRepository(ContactRole).find({
      where: {
        type: 'member',
        dateExpires: Between(args.since, args.until),
      },
      relations: { contact: { profile: true } },
    });

    log.info(`Got ${memberships.length} memberships`);

    // Filter contacts who are no longer active members but still have a newsletter status
    const inactiveContacts = memberships
      .filter(
        (m) =>
          m.contact.profile.newsletterStatus !== NewsletterStatus.None &&
          !m.contact.membership?.isActive
      )
      .map((m) => m.contact);

    const activeMemberTag = optionsService.getText(
      'newsletter-active-member-tag'
    );

    if (args.dryRun) {
      log.info('DRY RUN - Following actions would be performed:');
      log.info(
        `Contacts that would lose active member tag: ${inactiveContacts.length}`
      );
      for (const contact of inactiveContacts) {
        log.info(
          `- ${contact.email} (Newsletter status: ${contact.profile.newsletterStatus})`
        );
      }
      log.info('\nDRY RUN - No changes were made');
    } else {
      log.info(
        `Removing active member tag "${activeMemberTag}" from ${inactiveContacts.length} contacts`
      );
      await newsletterBulkService.removeTagFromContacts(
        inactiveContacts,
        activeMemberTag
      );
      log.info('Sync completed successfully');
    }
  });
};
