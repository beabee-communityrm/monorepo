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
 * The data structure holding the data for the reconciliation process.
 */
interface ReconciliationData {
  contactsToUpload: Contact[];
  existingContacts: Contact[];
  mismatchedContacts: [Contact, NewsletterContact][];
  nlContactsToImport: NewsletterContact[];
}

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
 * Fetch the list of contacts from both local database and newsletter service,
 * and categorize them into:
 * - Contacts that exist only our database and can be uploaded
 * - Contacts that exist only in the newsletter service and should be imported
 * - Contacts that exist in both
 *   - Of those, the contacts with mismatched data that should be fixed
 *
 * A limited reconciliation window can be provided to limit it to contacts
 * that have been changed on the newsletter service within that window. This
 * will disable uploading of new contacts from our database.
 *
 * @param startDate An optional start date for reconciliation
 * @param endDate An optional end date for reconciliation
 * @returns The reconciliation data
 */
async function fetchContacts(
  startDate: Date | undefined,
  endDate: Date | undefined
): Promise<ReconciliationData> {
  log.info('📡 Loading local contact list...');
  const contacts = await contactsService.find({ relations: { profile: true } });
  const window = startDate || endDate ? { startDate, endDate } : undefined;

  if (window) {
    log.info(
      `📡 Fetching newsletter contact list updates between ${startDate?.toISOString()} and ${endDate?.toISOString()}...`
    );
  } else {
    log.info('📡 Fetching whole newsletter contact list...');
  }
  const nlContacts = await newsletterBulkService.getNewsletterContacts(window);

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
    } else if (
      // If we are reconciling with a limited window, we can't assume the
      // contact is missing so we won't upload any new contacts
      !window &&
      // Only consider active statuses for upload
      (contact.profile.newsletterStatus === NewsletterStatus.Subscribed ||
        contact.profile.newsletterStatus === NewsletterStatus.Pending)
    ) {
      contactsToUpload.push(contact);
    }
  }

  // TODO: this filter could be removed once we delete expired pending contacts
  const nlContactsToImport = nlContacts.filter(
    (nc) => nc.status !== NewsletterStatus.Pending
  );

  return {
    contactsToUpload,
    existingContacts,
    mismatchedContacts,
    nlContactsToImport,
  };
}

/**
 * Prints a report detailing exactly what changes will be made during the
 * reconciliation process.
 *
 * @param data The reconciliation data
 * @param updateThem Whether we will be updating the newsletter service
 */
function printReport(data: ReconciliationData, updateThem: boolean) {
  log.info('');
  log.info('============ Reconciliation Report ============');

  log.info('📥 Contacts to import from newsletter service:');
  if (data.nlContactsToImport.length === 0) {
    log.info('  • (none)');
  }
  for (const nc of data.nlContactsToImport) {
    log.info(
      `  • ${nc.email}: status=${nc.status}, groups=[${groupsList(nc.groups)}]`
    );
  }

  log.info('⚠️ Mismatched contacts:');
  if (data.mismatchedContacts.length === 0) {
    log.info('  • (none)');
  }
  for (const [c, nc] of data.mismatchedContacts) {
    log.info(
      `  • ${c.email}: status=${c.profile.newsletterStatus}→${nc.status}, groups=[${groupsList(c.profile.newsletterGroups)}]→[${groupsList(nc.groups)}]`
    );
  }

  if (updateThem) {
    log.info('📤 New contacts to upload to newsletter service:');
    if (data.contactsToUpload.length === 0) {
      log.info('  • (none)');
    }
    for (const c of data.contactsToUpload) {
      log.info(
        `  • ${c.email}: status=${c.profile.newsletterStatus}, groups=[${groupsList(c.profile.newsletterGroups)}]`
      );
    }
  }

  log.info('');
}

/**
 * Reconcile our contact data based on the provided reconciliation data.
 * - Update the newsletter data for our local contacts
 * - Import missing contacts from the newsletter service
 *
 * @param data The reconciliation data
 * @param dryRun Whether to perform a dry run (no changes made)
 */
async function reconcileUs(data: ReconciliationData, dryRun: boolean) {
  log.info(
    `🔧 Fixing ${data.mismatchedContacts.length} mismatched contact statuses locally...`
  );
  if (!dryRun) {
    await newsletterBulkService.updateContactStatuses(data.mismatchedContacts);
  }

  log.info(
    `📥 Importing ${data.nlContactsToImport.length} contacts from newsletter service...`
  );
  if (!dryRun) {
    for (const nlContact of data.nlContactsToImport) {
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
}

/**
 * Update the newsletter service based on the provided reconciliation data.
 * - Upload new contacts to the newsletter service
 * - Update existing contacts in the newsletter service
 * - Update active member tags for contacts in the newsletter service
 *
 * @param data The reconciliation data
 * @param dryRun Whether to perform a dry run (no changes made)
 */
async function reconcileThem(data: ReconciliationData, dryRun: boolean) {
  log.info(
    `📤 Uploading ${data.contactsToUpload.length} new contacts to newsletter service...`
  );
  if (!dryRun) {
    await newsletterBulkService.upsertContacts(data.contactsToUpload);
  }

  log.info(
    `🔄 Updating ${data.existingContacts.length} existing contacts in newsletter service...`
  );
  if (!dryRun) {
    await newsletterBulkService.upsertContacts(data.existingContacts);
  }

  log.info(
    `🏷️ Updating active member tags for ${data.mismatchedContacts.length} contacts...`
  );
  if (!dryRun) {
    await newsletterBulkService.addTagToContacts(
      data.mismatchedContacts
        .filter(([c]) => c.membership?.isActive)
        .map(([c]) => c),
      optionsService.getText('newsletter-active-member-tag')
    );
    await newsletterBulkService.removeTagFromContacts(
      data.mismatchedContacts
        .filter(([c]) => !c.membership?.isActive)
        .map(([c]) => c),
      optionsService.getText('newsletter-active-member-tag')
    );
  }
}

/**
 * Reconcile newsletter contacts between our database and the newsletter
 * service. This tool can be used to ensure both sides have consistent data.
 *
 * @param argv The command line arguments
 */
export async function reconcile(
  argv: SyncNewsletterReconcileArgs
): Promise<void> {
  await runApp(async () => {
    const data = await fetchContacts(argv.startDate, argv.endDate);

    if (argv.report) {
      printReport(data, argv.updateThem);
    }

    if (argv.dryRun) {
      log.info('DRY RUN - No changes will actually be made');
    }

    await reconcileUs(data, argv.dryRun);

    if (argv.updateThem) {
      await reconcileThem(data, argv.dryRun);
    }

    log.info('✅ Newsletter reconciliation completed successfully!');
  });
}
