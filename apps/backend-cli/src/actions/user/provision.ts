import { getRepository } from '@beabee/core/database';
import { Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services/ContactsService';
import { idpService } from '@beabee/core/services/IdpService';

import { IsNull } from 'typeorm';

/**
 * Create identity provider users for all contacts that are not yet linked
 * and store the returned subject identifiers
 */
export const provisionUsers = async (): Promise<void> => {
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
    console.log(`Provisioning ${contacts.length} unlinked contact(s)`);

    let created = 0;
    let failed = 0;
    for (const contact of contacts) {
      const idpSubject = await idpService.createUser(contact);
      if (idpSubject) {
        await getRepository(Contact).update(contact.id, { idpSubject });
        created++;
      } else {
        console.error(`Failed to provision ${contact.email}`);
        failed++;
      }
    }

    console.log(`Provisioned ${created} contact(s), ${failed} failed`);
    if (failed > 0) {
      process.exitCode = 1;
    }
  });
};
