import { runApp } from '@beabee/core/server';
import { contactSyncBulkService } from '@beabee/core/services/ContactSyncBulkService';
import { contactsService } from '@beabee/core/services/ContactsService';

import { In } from 'typeorm';

import { SyncContactSyncServicePushArgs } from '../../../types/sync.js';

/**
 * Push contacts to the contact sync provider. Upserts are idempotent, so this
 * both backfills existing contacts and repairs the mirror after an outage.
 */
export const pushContacts = async (
  args: SyncContactSyncServicePushArgs
): Promise<void> => {
  await runApp(async () => {
    if (!contactSyncBulkService.isEnabled) {
      console.error(
        'No contact sync provider configured, set BEABEE_CONTACTSYNC_PROVIDER first'
      );
      process.exitCode = 1;
      return;
    }

    const contacts = await contactsService.find({
      where: args.contactIds ? { id: In(args.contactIds) } : {},
      relations: { profile: true },
    });
    console.log(`Pushing ${contacts.length} contact(s)`);
    if (args.dryRun) return;

    const failures = await contactSyncBulkService.upsertContacts(contacts);
    for (const failure of failures) {
      console.error(`Failed to push ${failure.contactId}: ${failure.error}`);
    }

    console.log(
      `Pushed ${contacts.length - failures.length} contact(s), ${failures.length} failed`
    );
    if (failures.length > 0) {
      process.exitCode = 1;
    }
  });
};
