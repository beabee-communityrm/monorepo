import { NewsletterStatus } from '@beabee/beabee-common';
import { createQueryBuilder } from '@beabee/core/database';
import { log as mainLogger } from '@beabee/core/logging';
import { Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { newsletterBulkService } from '@beabee/core/services';

import { SyncClearPendingStatusArgs } from '../../../types/sync.js';

const log = mainLogger.child({ app: 'sync-newsletter-clear-pending-status' });

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

    if (pendingContacts.length === 0) {
      log.info('✅ No contacts with pending newsletter status found.');
      return;
    }

    const nlContacts = await newsletterBulkService.fetchNewsletterContacts({
      emails: pendingContacts.map((c) => c.email),
    });
    const nlEmailsSet = new Set(nlContacts.map((nc) => nc.email));

    const contactsToUpdate = pendingContacts.filter(
      (contact) => !nlEmailsSet.has(contact.email)
    );

    log.info(`📊 Found ${contactsToUpdate.length} contacts to clear.`);

    if (args.dryRun) {
      log.info('DRY RUN - No changes will actually be made');
    }

    log.info('🧹 Clearing pending status for contacts:');
    for (const contact of contactsToUpdate) {
      log.info(`  • ${contact.email}`);
    }

    if (!args.dryRun) {
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
