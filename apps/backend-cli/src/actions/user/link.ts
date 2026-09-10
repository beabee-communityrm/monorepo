import { getRepository } from '@beabee/core/database';
import { Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services/ContactsService';
import { idpService } from '@beabee/core/services/IdpService';

import { IsNull } from 'typeorm';

/**
 * Link unlinked contacts to existing identity provider accounts by looking up
 * each contact's email at the identity provider
 */
export const linkUsers = async (): Promise<void> => {
  await runApp(async () => {
    if (!idpService.isEnabled) {
      console.error(
        'No identity provider configured, set BEABEE_IDP_PROVIDER first'
      );
      process.exitCode = 1;
      return;
    }

    const contacts = await contactsService.find({
      where: { idpSubject: IsNull() },
    });
    console.log(`Matching ${contacts.length} unlinked contact(s) by email`);

    let failed = 0;
    for (const contact of contacts) {
      const idpSubject = await idpService.findSubjectByEmail(contact.email);
      if (idpSubject) {
        await getRepository(Contact).update(contact.id, { idpSubject });
        console.log(`Linked ${contact.email} to subject ${idpSubject}`);
      } else {
        console.error(`No IdP account found for ${contact.email}`);
        failed++;
      }
    }

    if (failed > 0) {
      console.error(`${failed} contact(s) could not be linked`);
      process.exitCode = 1;
    }
  });
};
