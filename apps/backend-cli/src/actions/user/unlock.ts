import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services/ContactsService';
import { idpService } from '@beabee/core/services/IdpService';
import { normalizeEmailAddress } from '@beabee/core/utils/email';

import type { UnlockUserArgs } from '../../types/user.js';

/**
 * Lifts the identity provider's lock on a user's account
 */
export const unlockUser = async (args: UnlockUserArgs): Promise<void> => {
  await runApp(async () => {
    if (!idpService.isEnabled) {
      console.error(
        'No identity provider configured, set BEABEE_IDP_PROVIDER first'
      );
      process.exitCode = 1;
      return;
    }

    const contact = await contactsService.findOneBy({
      email: normalizeEmailAddress(args.email),
    });
    if (!contact) {
      console.error(`No user with email ${args.email}`);
      process.exitCode = 1;
      return;
    }

    await idpService.unlockContact(contact);
    console.log(`Unlocked ${contact.email} at the identity provider`);
  });
};
