import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services/ContactsService';
import { idpService } from '@beabee/core/services/IdpService';
import { normalizeEmailAddress } from '@beabee/core/utils/email';

import type { UnlockUserArgs } from '../../types/user.js';

/**
 * Lifts the lock on a user's account: the local password-tries counter, and
 * the identity provider's lock when the user is linked to one
 */
export const unlockUser = async (args: UnlockUserArgs): Promise<void> => {
  await runApp(async () => {
    const contact = await contactsService.findOneBy({
      email: normalizeEmailAddress(args.email),
    });
    if (!contact) {
      console.error(`No user with email ${args.email}`);
      process.exitCode = 1;
      return;
    }

    await contactsService.resetPasswordTries(contact);
    console.log(`Reset the password tries of ${contact.email}`);

    if (idpService.isEnabled && contact.idpSubject) {
      await idpService.unlockContact(contact);
      console.log(`Unlocked ${contact.email} at the identity provider`);
    }
  });
};
