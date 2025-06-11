import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services/ContactsService';

import { select } from '@inquirer/prompts';

export const deleteUser = async (email: string): Promise<void> => {
  await runApp(async () => {
    const contact = await contactsService.findOneBy({ email });

    if (!contact) {
      console.error(`No user found with email ${email}`);
      process.exit(1);
    }

    const answer = await select({
      message: `Are you sure you want to permanently delete user ${contact.fullname} (${contact.email})?`,
      choices: [
        { name: 'No', value: false },
        { name: 'Yes', value: true },
      ],
    });

    if (!answer) {
      console.log('Deletion cancelled');
      return;
    }

    try {
      await contactsService.permanentlyDeleteContact(contact);
      console.log('User deleted successfully!');
    } catch (error) {
      console.error('Failed to delete user:', error);
      process.exit(1);
    }
  });
};
