import {
  JobName,
  NewsletterReconcileJobArgs,
  NewsletterReconcileTest,
  NewsletterStatus,
} from '@beabee/beabee-common';
import { Contact } from '@beabee/core/models';
import {
  contactsService,
  newsletterBulkService,
  optionsService,
} from '@beabee/core/services';
import { NewsletterContact } from '@beabee/core/type';

import { NewsletterReconcileJobArgsDto } from '#api/dto/JobDto';
import type { Job, JobLogger } from '#type/job';

interface ReconciliationData {
  contactsToUpload: Contact[];
  mismatchesToFix: Mismatch[];
  nlContactsToImport: NewsletterContact[];
}

/** A reliably comparable string representation of a groups list */
function groupsList(groups: string[]): string {
  return groups
    .slice()
    .sort((a, b) => (a < b ? -1 : 1))
    .join(',');
}

/** A contact, newsletter contact and a list of their mismatched tests */
type Mismatch = [Contact, NewsletterContact, NewsletterReconcileTest[]];

/** A test for one kind of mismatch between local and newsletter contact data */
interface MismatchTest {
  test: (contact: Contact, nlContact: NewsletterContact) => boolean;
  print: (contact: Contact, nlContact: NewsletterContact) => string;
  reconcile: (mismatches: Mismatch[]) => Promise<void>;
}

const mismatchTests: Record<NewsletterReconcileTest, MismatchTest> = {
  // The local status does not match the newsletter service, update locally
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
  // The local groups do not match the newsletter service, update locally
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
  // The active member tag on the newsletter service is wrong, update there
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
  // The active user tag on the newsletter service is wrong, update there
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
 * Loads contacts from the database and the newsletter service and sorts them
 * into contacts to upload, contacts to import and mismatches to fix. A window
 * limits the newsletter side to contacts changed within it.
 */
async function fetchContacts(
  args: NewsletterReconcileJobArgs,
  log: JobLogger
): Promise<ReconciliationData> {
  log.info('📡 Loading local contact list...');
  const contacts = await contactsService.find({ relations: { profile: true } });

  if (args.since || args.until) {
    log.info(
      `📡 Fetching newsletter contact list updates between ${args.since?.toISOString()} and ${args.until?.toISOString()}...`
    );
  } else {
    log.info('📡 Fetching whole newsletter contact list...');
  }
  const nlContacts = await newsletterBulkService.fetchNewsletterContacts({
    updated: { since: args.since, until: args.until },
  });

  log.info(
    `📊 Found ${contacts.length} local contacts and ${nlContacts.length} newsletter contacts`
  );

  const contactsToUpload: Contact[] = [],
    mismatchesToFix: Mismatch[] = [];

  for (const contact of contacts) {
    const i = nlContacts.findIndex((nc) => nc.email === contact.email);

    // Remove found contacts so the leftovers are the ones only the
    // newsletter service knows
    const nlContact = i !== -1 ? nlContacts.splice(i, 1)[0] : undefined;

    if (nlContact) {
      const matchedTestIds = args.fix.filter((id) =>
        mismatchTests[id].test(contact, nlContact)
      );
      if (matchedTestIds.length > 0) {
        mismatchesToFix.push([contact, nlContact, matchedTestIds]);
      }
    } else if (
      args.uploadNew &&
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

function printReport(
  data: ReconciliationData,
  args: NewsletterReconcileJobArgs,
  log: JobLogger
) {
  log.info('============ Reconciliation Report ============');

  if (args.importNew) {
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

  if (args.uploadNew) {
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
}

async function importNlContacts(
  nlContacts: NewsletterContact[],
  dryRun: boolean,
  log: JobLogger
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
        null,
        { sync: false }
      );
    }
  }
}

async function uploadNew(contacts: Contact[], dryRun: boolean, log: JobLogger) {
  log.info(
    `📤 Uploading ${contacts.length} new contacts to newsletter service...`
  );
  if (!dryRun) {
    await newsletterBulkService.upsertContacts(contacts);
  }
}

async function runMismatchFixes(
  mismatches: Mismatch[],
  testIds: NewsletterReconcileTest[],
  dryRun: boolean,
  log: JobLogger
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
 * Reconciles contacts between the database and the newsletter service so
 * both sides hold consistent data
 */
export const newsletterReconcileJob: Job<JobName.NewsletterReconcile> = {
  argsDto: NewsletterReconcileJobArgsDto,
  async run(args, log) {
    // A window only fetches part of the newsletter list, so contacts missing
    // from it are not necessarily new
    if ((args.since || args.until) && args.uploadNew) {
      throw new Error('Cannot use since or until together with uploadNew');
    }

    const dryRun = !!args.dryRun;
    const data = await fetchContacts(args, log);

    if (args.report) {
      printReport(data, args, log);
    }

    if (dryRun) {
      log.info('DRY RUN - No changes will actually be made');
    }

    if (args.importNew) {
      await importNlContacts(data.nlContactsToImport, dryRun, log);
    }
    await runMismatchFixes(data.mismatchesToFix, args.fix, dryRun, log);
    if (args.uploadNew) {
      await uploadNew(data.contactsToUpload, dryRun, log);
    }

    log.info('✅ Newsletter reconciliation completed successfully!');
  },
};
