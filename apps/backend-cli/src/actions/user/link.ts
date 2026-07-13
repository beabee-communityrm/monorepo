import { getRepository } from '@beabee/core/database';
import { Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services/ContactsService';
import { idpService } from '@beabee/core/services/IdpService';
import { normalizeEmailAddress } from '@beabee/core/utils/email';

import { readFile } from 'fs/promises';
import { IsNull } from 'typeorm';

import type { LinkUserArgs } from '../../types/user.js';

async function linkContact(
  contact: Contact,
  idpSubject: string
): Promise<void> {
  await getRepository(Contact).update(contact.id, { idpSubject });
  console.log(`Linked ${contact.email} to subject ${idpSubject}`);
}

/**
 * Link existing contacts to identity provider users, either from a CSV of
 * email,subject pairs or by looking up each unlinked contact's email at the
 * identity provider
 */
export const linkUsers = async (argv: LinkUserArgs): Promise<void> => {
  await runApp(async () => {
    let failed = 0;

    if (argv.csv) {
      const rows = (await readFile(argv.csv, 'utf-8'))
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '')
        .map((line) => line.split(',').map((col) => col.trim()));

      // Skip a header row if present
      if (rows[0]?.[0]?.toLowerCase() === 'email') {
        rows.shift();
      }

      for (const [email, idpSubject] of rows) {
        if (!email || !idpSubject) {
          console.error(`Invalid row: ${email},${idpSubject}`);
          failed++;
          continue;
        }
        const contact = await contactsService.findOneBy({
          email: normalizeEmailAddress(email),
        });
        if (contact) {
          await linkContact(contact, idpSubject);
        } else {
          console.error(`No contact found for ${email}`);
          failed++;
        }
      }
    } else {
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

      for (const contact of contacts) {
        const idpSubject = await idpService.findUserByEmail(contact.email);
        if (idpSubject) {
          await linkContact(contact, idpSubject);
        } else {
          console.error(`No IdP user found for ${contact.email}`);
          failed++;
        }
      }
    }

    if (failed > 0) {
      console.error(`${failed} contact(s) could not be linked`);
      process.exitCode = 1;
    }
  });
};
