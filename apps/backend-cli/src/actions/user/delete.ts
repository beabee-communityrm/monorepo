import { Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services/ContactsService';

import { select } from '@inquirer/prompts';

import type { DeleteUserArgs } from '../../types/user.js';
import { findUsers } from './list.js';

/**
 * Deletes users based on email or filter criteria
 * @param args Delete arguments
 */
export const deleteUsers = async (args: DeleteUserArgs): Promise<void> => {
  await runApp(async () => {
    const contacts = await findUsers(args);

    if (contacts.length === 0) {
      console.log(getNoUsersMessage(args));
      return;
    }

    console.log(`\nFound ${contacts.length} user(s) to delete:`);
    console.log('--------------------------------------------------');
    for (const contact of contacts) {
      console.log(`- ${contact.fullname} (${contact.email})`);
    }
    console.log('--------------------------------------------------');

    if (!args.force) {
      const answer = await select({
        message: `Are you sure you want to permanently delete ${contacts.length} user(s)?`,
        choices: [
          { name: 'No', value: false },
          { name: 'Yes', value: true },
        ],
      });

      if (!answer) {
        console.log('Deletion cancelled');
        return;
      }
    }

    let successCount = 0;
    let errorCount = 0;

    for (const contact of contacts) {
      try {
        await deleteContact(contact);
        console.log(`✓ Deleted: ${contact.fullname} (${contact.email})`);
        successCount++;
      } catch (error) {
        console.error(
          `✗ Failed to delete ${contact.email}:`,
          error instanceof Error ? error.message : error
        );
        errorCount++;
      }
    }

    console.log(`\nCompleted: ${successCount} deleted, ${errorCount} failed`);

    if (errorCount > 0) {
      process.exit(1);
    }
  });
};

/**
 * Deletes a single contact with full cleanup of dependent data
 */
async function deleteContact(contact: Contact): Promise<void> {
  await contactsService.permanentlyDeleteContact(contact);
}

/**
 * Returns appropriate message when no users are found
 */
function getNoUsersMessage(args: DeleteUserArgs): string {
  if (args.withoutPassword) {
    return 'No users without password found';
  }
  if (args.email) {
    return `No user found with email ${args.email}`;
  }
  return 'No users found';
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use deleteUsers instead
 */
export const deleteUser = async (email: string): Promise<void> => {
  return deleteUsers({ email });
};
