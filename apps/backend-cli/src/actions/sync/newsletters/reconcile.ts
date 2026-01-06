import { NewsletterStatus } from '@beabee/beabee-common';
import { log as mainLogger } from '@beabee/core/logging';
import { Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import {
  contactsService,
  newsletterBulkService,
  optionsService,
} from '@beabee/core/services';
import { NewsletterContact } from '@beabee/core/type';

import { SyncNewsletterReconcileArgs } from '../../../types/sync.js';

const log = mainLogger.child({ app: 'sync-newsletter-reconcile' });

/**
 * Returns a reliably comparable string representation of the groups list for
 * comparison
 *
 * @param groups A list of groups
 * @returns A comparable string representation of the groups
 */
function groupsList(groups: string[]): string {
  return groups
    .slice()
    .sort((a, b) => (a < b ? -1 : 1))
    .join(',');
}

/**
 * Checks whether the local and newsletter contact have mismatched
 * contact data.
 *
 * @param contact The local contact
 * @param nlContact The newsletter contact
 * @returns Whether the contacts are mismatched
 */
function isMismatchedContact(contact: Contact, nlContact: NewsletterContact) {
  return (
    contact.profile.newsletterStatus !== nlContact.status ||
    groupsList(contact.profile.newsletterGroups) !==
      groupsList(nlContact.groups) ||
    !!contact.membership?.isActive !==
      nlContact.tags.includes(
        optionsService.getText('newsletter-active-member-tag')
      )
  );
}

/**
 * Reconcile newsletter contacts between our database and the newsletter
 * service.
 *
 * The reconciliation process includes:
 * - Identifying contacts that exist in our database but not in the newsletter
 *   service, and vice versa.
 * - Detecting mismatches in subscription statuses and group memberships.
 * - Optionally updating the newsletter service to align with our records.
 * - Generating a report of discrepancies found during the reconciliation.
 *
 * @param argv  The command line arguments
 */
export async function reconcile(
  argv: SyncNewsletterReconcileArgs
): Promise<void> {
  await runApp(async () => {
    log.info('📡 Fetching contact lists...');

    const contacts = await contactsService.find({
      relations: { profile: true },
    });
    const nlContacts = await newsletterBulkService.getNewsletterContacts();

    log.info(
      `📊 Found ${contacts.length} local contacts and ${nlContacts.length} newsletter contacts`
    );

    const contactsToUpload: Contact[] = [],
      existingContacts: Contact[] = [],
      mismatchedContacts: [Contact, NewsletterContact][] = [];

    for (const contact of contacts) {
      const i = nlContacts.findIndex((nc) => nc.email === contact.email);

      // Remove found contact so we can later see which contacts are in the
      // newsletter service but not in our database
      const nlContact = i !== -1 ? nlContacts.splice(i, 1)[0] : undefined;

      if (nlContact) {
        existingContacts.push(contact);

        if (isMismatchedContact(contact, nlContact)) {
          mismatchedContacts.push([contact, nlContact]);
        }

        // Only consider active statuses for upload
      } else if (
        contact.profile.newsletterStatus === NewsletterStatus.Subscribed ||
        contact.profile.newsletterStatus === NewsletterStatus.Pending
      ) {
        contactsToUpload.push(contact);
      }
    }

    // TODO: this filter could be removed once we delete expired pending contacts
    const nlContactsToImport = nlContacts.filter(
      (nc) => nc.status !== NewsletterStatus.Pending
    );

    if (argv.report) {
      log.info('');
      log.info('============ Reconciliation Report ============');
      log.info('📥 Contacts to import from newsletter service:');
      if (nlContactsToImport.length === 0) {
        log.info('  • (none)');
      }
      for (const nc of nlContactsToImport) {
        log.info(
          `  • ${nc.email}: status=${nc.status}, groups=[${groupsList(nc.groups)}]`
        );
      }

      log.info('⚠️ Mismatched contacts:');
      if (mismatchedContacts.length === 0) {
        log.info('  • (none)');
      }
      for (const [c, nc] of mismatchedContacts) {
        log.info(
          `  • ${c.email}: status=${c.profile.newsletterStatus}→${nc.status}, groups=[${groupsList(c.profile.newsletterGroups)}]→[${groupsList(nc.groups)}]`
        );
      }

      if (argv.updateThem) {
        log.info('📤 New contacts to upload to newsletter service:');
        if (contactsToUpload.length === 0) {
          log.info('  • (none)');
        }
        for (const c of contactsToUpload) {
          log.info(
            `  • ${c.email}: status=${c.profile.newsletterStatus}, groups=[${groupsList(c.profile.newsletterGroups)}]`
          );
        }
      }

      log.info('');
    }

    if (argv.dryRun) {
      log.info('DRY RUN - No changes will actually be made');
    }

    log.info(
      `🔧 Fixing ${mismatchedContacts.length} mismatched contact statuses locally...`
    );
    if (!argv.dryRun) {
      await newsletterBulkService.updateContactStatuses(mismatchedContacts);
    }

    log.info(
      `📥 Importing ${nlContactsToImport.length} contacts from newsletter service...`
    );
    if (!argv.dryRun) {
      for (const nlContact of nlContactsToImport) {
        await contactsService.createContact(
          {
            email: nlContact.email,
            firstname: nlContact.firstname,
            lastname: nlContact.lastname,
            joined: nlContact.joined,
          },
          {
            newsletterStatus: nlContact.status,
            newsletterGroups: nlContact.groups,
          },
          { sync: false }
        );
      }
    }

    if (argv.updateThem) {
      log.info(
        `📤 Uploading ${contactsToUpload.length} new contacts to newsletter service...`
      );
      if (!argv.dryRun) {
        await newsletterBulkService.upsertContacts(contactsToUpload);
      }

      log.info(
        `🔄 Updating ${existingContacts.length} existing contacts in newsletter service...`
      );
      if (!argv.dryRun) {
        await newsletterBulkService.upsertContacts(existingContacts);
      }

      log.info(
        `🏷️ Updating active member tags for ${mismatchedContacts.length} contacts...`
      );
      if (!argv.dryRun) {
        await newsletterBulkService.addTagToContacts(
          mismatchedContacts
            .filter(([c]) => c.membership?.isActive)
            .map(([c]) => c),
          optionsService.getText('newsletter-active-member-tag')
        );
        await newsletterBulkService.removeTagFromContacts(
          mismatchedContacts
            .filter(([c]) => !c.membership?.isActive)
            .map(([c]) => c),
          optionsService.getText('newsletter-active-member-tag')
        );
      }
    }

    log.info('✅ Newsletter reconciliation completed successfully!');
  });
}
