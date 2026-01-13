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

import {
  SyncNewsletterReconcileArgs,
  SyncNewsletterReconcileTestId,
} from '../../../types/sync.js';

const log = mainLogger.child({ app: 'sync-newsletter-reconcile' });

interface ReconciliationData {
  contactsToUpload: Contact[];
  mismatchesToFix: Mismatch[];
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

/** A contact, newsletter contact and a list of their mismatched tests */
type Mismatch = [Contact, NewsletterContact, SyncNewsletterReconcileTestId[]];

/**
 * A test for a specific type of mismatch between local contact data and
 * newsletter contact data.
 */
interface MismatchTest {
  /** Tests whether the contact is mismatched */
  test: (contact: Contact, nlContact: NewsletterContact) => boolean;

  /** Returns a string representation of the mismatch */
  print: (contact: Contact, nlContact: NewsletterContact) => string;

  /** Reconciles the mismatched data */
  reconcile: (mismatches: Mismatch[]) => Promise<void>;
}

/**
 * The list of tests to check for mismatched contact data.
 */
const mismatchTests: Record<SyncNewsletterReconcileTestId, MismatchTest> = {
  /**
   * Fix mismatched newsletter statuses
   *
   * The local contact's newsletter status does not match the newsletter
   * contact's status. Update local contact statuses.
   * */
  status: {
    test: (contact, nlContact) =>
      contact.profile.newsletterStatus !== nlContact.status,
    print: (contact, nlContact) =>
      `status=${contact.profile.newsletterStatus}→${nlContact.status}`,
    reconcile: async (mismatchedContacts) => {
      await newsletterBulkService.updateContactNlData(
        mismatchedContacts.map(([contact, nlContact]) => ({
          contact,
          updates: { newsletterStatus: nlContact.status },
        }))
      );
    },
  },
  /**
   * Fix mismatched newsletter groups
   *
   * The local contact's newsletter groups do not match the newsletter
   * contact's groups. Update local contact groups.
   * */
  groups: {
    test: (contact, nlContact) =>
      groupsList(contact.profile.newsletterGroups) !==
      groupsList(nlContact.groups),
    print: (contact, nlContact) =>
      `groups=[${groupsList(contact.profile.newsletterGroups)}]→[${groupsList(nlContact.groups)}]`,
    reconcile: async (mismatchedContacts) => {
      await newsletterBulkService.updateContactNlData(
        mismatchedContacts.map(([contact, nlContact]) => ({
          contact,
          updates: { newsletterGroups: nlContact.groups },
        }))
      );
    },
  },
  /**
   * Fix missing or incorrect active member tags
   *
   * The locale contact's active member status does not match the presence of
   * the active member tag on the newsletter contact. Update the tags on the
   * newsletter service.
   * */
  'active-member-tag': {
    test: (contact, nlContact) =>
      !!contact.membership?.isActive !== nlContact.isActiveMember,
    print: (contact) =>
      'active-member-tag=' +
      (contact.membership?.isActive ? 'no->yes' : 'yes->no'),
    reconcile: async (mismatches) => {
      const activeMemberTag = optionsService.getText(
        'newsletter-active-member-tag'
      );
      await newsletterBulkService.updateContactTags(
        mismatches.map(([c]) => ({
          email: c.email,
          tags: [{ name: activeMemberTag, active: !!c.membership?.isActive }],
        }))
      );
    },
  },
  /**
   * Fix missing or incorrect active user tags
   *
   * The local contact's active user status does not match the presence of
   * the active user tag on the newsletter contact. Update the tags on the
   * newsletter service.
   */
  'active-user-tag': {
    test: (contact, nlContact) =>
      !!contact.password.hash !== nlContact.isActiveUser,
    print: (contact) =>
      'active-user-tag=' + (contact.password.hash ? 'no->yes' : 'yes->no'),
    reconcile: async (mismatches) => {
      const activeUserTag = optionsService.getText(
        'newsletter-active-user-tag'
      );
      await newsletterBulkService.updateContactTags(
        mismatches.map(([c]) => ({
          email: c.email,
          tags: [{ name: activeUserTag, active: !!c.password.hash }],
        }))
      );
    },
  },
};

/**
 * Fetch the list of contacts from both local database and newsletter service,
 * and categorize them into:
 * - Contacts that exist only our database and can be uploaded
 * - Contacts that exist only in the newsletter service and should be imported
 * - Contacts that exist in both
 *   - Of those, the contacts with mismatched data that should be fixed

 * A limited reconciliation window can be provided to limit it to contacts
 * that have been changed on the newsletter service within that window.
 *
 * @params argv The command line arguments
 * @returns The reconciliation data
 */
async function fetchContacts(
  argv: SyncNewsletterReconcileArgs
): Promise<ReconciliationData> {
  log.info('📡 Loading local contact list...');
  const contacts = await contactsService.find({ relations: { profile: true } });

  if (argv.since || argv.until) {
    log.info(
      `📡 Fetching newsletter contact list updates between ${argv.since?.toISOString()} and ${argv.until?.toISOString()}...`
    );
  } else {
    log.info('📡 Fetching whole newsletter contact list...');
  }
  const nlContacts = await newsletterBulkService.getNewsletterContacts({
    since: argv.since,
    until: argv.until,
  });

  log.info(
    `📊 Found ${contacts.length} local contacts and ${nlContacts.length} newsletter contacts`
  );

  const contactsToUpload: Contact[] = [],
    mismatchesToFix: Mismatch[] = [];

  for (const contact of contacts) {
    const i = nlContacts.findIndex((nc) => nc.email === contact.email);

    // Remove found contact so we can later see which contacts are in the
    // newsletter service but not in our database
    const nlContact = i !== -1 ? nlContacts.splice(i, 1)[0] : undefined;

    if (nlContact) {
      const matchedTestIds = argv.fix.filter((id) =>
        mismatchTests[id].test(contact, nlContact)
      );
      if (matchedTestIds.length > 0) {
        mismatchesToFix.push([contact, nlContact, matchedTestIds]);
      }
    } else if (
      argv.uploadNew &&
      // Only consider active statuses for upload
      (contact.profile.newsletterStatus === NewsletterStatus.Subscribed ||
        contact.profile.newsletterStatus === NewsletterStatus.Pending)
    ) {
      contactsToUpload.push(contact);
    }
  }

  return {
    contactsToUpload,
    mismatchesToFix,
    nlContactsToImport: nlContacts,
  };
}

/**
 * Prints a report detailing exactly what changes will be made during the
 * reconciliation process.
 *
 * @param data The reconciliation data
 * @param uploadNew Whether we will be updating the newsletter service
 */
function printReport(
  data: ReconciliationData,
  argv: SyncNewsletterReconcileArgs
) {
  log.info('');
  log.info('============ Reconciliation Report ============');

  if (argv.importNew) {
    log.info('📥 Contacts to import from newsletter service:');
    if (data.nlContactsToImport.length === 0) {
      log.info('  • (none)');
    }
    for (const nc of data.nlContactsToImport) {
      log.info(
        `  • ${nc.email}: status=${nc.status}, groups=[${groupsList(nc.groups)}]`
      );
    }
  }

  log.info('⚠️ Mismatched contacts:');
  if (data.mismatchesToFix.length === 0) {
    log.info('  • (none)');
  }
  for (const [c, nc, ids] of data.mismatchesToFix) {
    log.info(
      `  • ${c.email}: ${ids.map((id) => mismatchTests[id].print(c, nc)).join(', ')}`
    );
  }

  if (argv.uploadNew) {
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
 * Import contacts from the newsletter service into our database.
 *
 * @param nlContacts The newsletter contacts to import
 * @param dryRun Whether to perform a dry run (no changes made)
 */
async function importNlContacts(
  nlContacts: NewsletterContact[],
  dryRun: boolean
) {
  log.info(
    `📥 Importing ${nlContacts.length} contacts from newsletter service...`
  );

  // TODO: this filter could be removed once we delete expired pending contacts
  const validNlContacts = nlContacts.filter(
    (nc) => nc.status !== NewsletterStatus.Pending
  );

  log.info(
    `  ℹ️ Skipping ${nlContacts.length - validNlContacts.length} contacts with pending status`
  );

  if (!dryRun) {
    for (const nlContact of validNlContacts) {
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
 * Upload new contacts to the newsletter service.
 *
 * @param contacts The contacts to upload
 * @param dryRun Whether to perform a dry run (no changes made)
 */
async function uploadNew(contacts: Contact[], dryRun: boolean) {
  log.info(
    `📤 Uploading ${contacts.length} new contacts to newsletter service...`
  );
  if (!dryRun) {
    await newsletterBulkService.upsertContacts(contacts);
  }
}

/**
 * Run the fixes for all of the given mismatches found.
 *
 * @param mismatches The list of mismatches
 * @param testIds The list of test IDs to fix
 * @param dryRun Whether to perform a dry run (no changes made)
 */
async function runMismatchFixes(
  mismatches: Mismatch[],
  testIds: SyncNewsletterReconcileTestId[],
  dryRun: boolean
) {
  for (const testId of testIds) {
    const mismatchesForTest = mismatches.filter(([, , m]) =>
      m.includes(testId)
    );
    log.info(
      `️🛠️ Fixing ${mismatchesForTest.length} mismatched contacts for test "${testId}"...`
    );
    if (mismatchesForTest.length > 0 && !dryRun) {
      await mismatchTests[testId].reconcile(mismatchesForTest);
    }
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
    // Prevent uploading new contacts when we are only fetching limited data
    // from the newsletter service
    if ((argv.since || argv.until) && argv.uploadNew) {
      log.error('Cannot use --since or --until with --uploadNew');
      return;
    }

    const data = await fetchContacts(argv);

    if (argv.report) {
      printReport(data, argv);
    }

    if (argv.dryRun) {
      log.info('DRY RUN - No changes will actually be made');
    }

    if (argv.importNew) {
      await importNlContacts(data.nlContactsToImport, argv.dryRun);
    }
    await runMismatchFixes(data.mismatchesToFix, argv.fix, argv.dryRun);
    if (argv.uploadNew) {
      await uploadNew(data.contactsToUpload, argv.dryRun);
    }

    log.info('✅ Newsletter reconciliation completed successfully!');
  });
}
