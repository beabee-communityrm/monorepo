import { log as mainLogger } from '@beabee/core/logging';
import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services';
import { newsletterService } from '@beabee/core/services/NewsletterService';
import { normalizeEmailAddress } from '@beabee/core/utils/email';

const log = mainLogger.child({ app: 'newsletter-status-sync' });

interface SyncNewsletterStatusArgs {
  dryRun: boolean;
}

/**
 * Sync all newsletter subscription statuses from MailChimp to the local database
 *
 * @param dryRun Whether to run without making changes
 */
export const syncNewsletterStatus = async (
  args: SyncNewsletterStatusArgs
): Promise<void> => {
  await runApp(async () => {
    log.info('Fetching all contacts from MailChimp...');

    // Get all contacts from MailChimp
    const nlContacts = await newsletterService.getNewsletterContacts();

    log.info(`Found ${nlContacts.length} contacts in MailChimp`);

    let syncedCount = 0;
    let unchangedCount = 0;
    let errorCount = 0;

    for (const nlContact of nlContacts) {
      try {
        const normalizedEmail = normalizeEmailAddress(nlContact.email);
        const contact = await contactsService.findOne({
          where: { email: normalizedEmail },
          relations: { profile: true },
        });

        if (!contact) {
          // Contact doesn't exist locally, skip it
          unchangedCount++;
          continue;
        }

        // Contact exists, update if needed
        const localStatus = contact.profile?.newsletterStatus;
        const mailchimpStatus = nlContact.status;

        if (localStatus === mailchimpStatus) {
          unchangedCount++;
          continue;
        }

        if (args.dryRun) {
          log.info(
            `Would update ${normalizedEmail}: ${localStatus} → ${mailchimpStatus}`
          );
          syncedCount++;
        } else {
          log.info(
            `Updating ${normalizedEmail}: ${localStatus} → ${mailchimpStatus}`
          );
          await contactsService.updateContactProfile(contact, {
            newsletterStatus: nlContact.status,
            newsletterGroups: nlContact.groups || [],
          });
          syncedCount++;
        }
      } catch (error) {
        errorCount++;
        log.error(`Error syncing ${nlContact.email}:`, error);
      }
    }

    log.info('\nSync summary:');
    log.info(`- Synced (updated): ${syncedCount}`);
    log.info(`- Unchanged: ${unchangedCount}`);
    log.info(`- Errors: ${errorCount}`);

    if (args.dryRun) {
      log.info('\nDRY RUN - No changes were made');
    } else {
      log.info('\nSync completed successfully');
    }
  });
};
