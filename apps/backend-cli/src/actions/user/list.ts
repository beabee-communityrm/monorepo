import { createQueryBuilder } from '@beabee/core/database';
import { Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';

import type { ListUserArgs } from '../../types/user.js';

/**
 * Lists users with optional filters
 * @param args Filter arguments
 * @returns Array of contacts (for use by other commands)
 */
export const listUsers = async (args: ListUserArgs = {}): Promise<void> => {
  await runApp(async () => {
    const contacts = await findUsers(args);

    if (contacts.length === 0) {
      console.log(getNoUsersMessage(args));
      return;
    }

    console.log(`\nFound ${contacts.length} user(s):`);
    console.log('--------------------------------------------------');
    for (const contact of contacts) {
      printContact(contact);
      console.log('--------------------------------------------------');
    }
  });
};

/**
 * Finds users matching the given filters
 */
export async function findUsers(args: ListUserArgs = {}): Promise<Contact[]> {
  const qb = createQueryBuilder(Contact, 'contact')
    .leftJoinAndSelect('contact.roles', 'roles')
    .leftJoinAndSelect('contact.profile', 'profile')
    .leftJoinAndSelect('contact.contribution', 'contribution')
    .orderBy('contact.joined', 'DESC');

  if (args.email) {
    qb.andWhere('contact.email = :email', { email: args.email });
  }

  if (args.withoutPassword) {
    qb.andWhere(
      '(contact."passwordHash" = \'\' OR contact."passwordHash" IS NULL)'
    );
  }

  return qb.getMany();
}

/**
 * Prints contact details to console
 */
function printContact(contact: Contact): void {
  console.log(`ID: ${contact.id}`);
  console.log(`Name: ${contact.fullname}`);
  console.log(`Email: ${contact.email}`);
  console.log(`Joined: ${contact.joined.toISOString()}`);
  console.log(`Last seen: ${contact.lastSeen?.toISOString() || 'Never'}`);
  console.log(`Has password: ${contact.password.hash !== ''}`);

  if (contact.roles.length > 0) {
    console.log('Roles:');
    contact.roles.forEach((role) => {
      console.log(
        `  - ${role.type}${role.dateExpires ? ` (expires: ${role.dateExpires.toISOString()})` : ''}`
      );
    });
  }

  console.log(`Contribution Type: ${contact.contributionType}`);
  if (contact.contributionMonthlyAmount) {
    console.log(
      `Monthly Amount: €${contact.contributionMonthlyAmount.toFixed(2)}`
    );
  }
  if (contact.contributionPeriod) {
    console.log(`Contribution Period: ${contact.contributionPeriod}`);
  }

  if (contact.profile) {
    if (contact.profile.telephone) {
      console.log(`Telephone: ${contact.profile.telephone}`);
    }
    if (contact.profile.twitter) {
      console.log(`Twitter: ${contact.profile.twitter}`);
    }
    if (contact.profile.description) {
      console.log(`Description: ${contact.profile.description}`);
    }
    if (contact.profile.newsletterStatus) {
      console.log(`Newsletter Status: ${contact.profile.newsletterStatus}`);
    }
  }
}

/**
 * Returns appropriate message when no users are found
 */
function getNoUsersMessage(args: ListUserArgs): string {
  if (args.withoutPassword) {
    return 'No users without password found';
  }
  if (args.email) {
    return `No users found for ${args.email}`;
  }
  return 'No users found';
}
