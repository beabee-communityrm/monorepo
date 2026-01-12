import { NewsletterStatus } from '@beabee/beabee-common';
import { createQueryBuilder } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { newsletterBulkService } from '@beabee/core/services';

import { SyncClearPendingStatusArgs } from '../../../types/sync.js';

const log = mainLogger.child({ app: 'sync-newsletter-active-member-tag' });

export async function clearPendingStatus(
  args: SyncClearPendingStatusArgs
): Promise<void> {
  await runApp(async () => {
    log.info('📡 Fetching contact lists...');

    const pendingContacts = await createQueryBuilder(Contact, 'contact')
      .innerJoin('contact.profile', 'profile')
      .where('profile.newsletterStatus = :status', {
        status: NewsletterStatus.Pending,
      })
      .getMany();

    const nlContacts = await newsletterBulkService.fetchNewsletterContacts({
      emails: pendingContacts.map((c) => c.email),
    });
    const nlEmailsSet = new Set(nlContacts.map((nc) => nc.email));

    const contactsToUpdate = pendingContacts.filter(
      (contact) => !nlEmailsSet.has(contact.email)
    );

    log.info(`📊 Found ${contactsToUpdate.length} contacts to clear.`);

    if (args.dryRun) {
      log.info('DRY RUN - Following contacts would have their status cleared:');
      for (const contact of contactsToUpdate) {
        log.info(`  • ${contact.email}`);
      }
    } else {
      await newsletterBulkService.updateContactNlData(
        contactsToUpdate.map((contact) => ({
          contact,
          updates: {
            newsletterStatus: NewsletterStatus.None,
            newsletterGroups: [],
          },
        }))
      );
    }

    log.info('✅ Done clearing pending statuses.');
  });
}
