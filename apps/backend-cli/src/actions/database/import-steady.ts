import {
  Address,
  ContributionPeriod,
  ContributionType,
  NewsletterStatus,
} from '@beabee/beabee-common';
import { getRepository } from '@beabee/core/database';
import {
  Contact,
  ContactRole,
  ContactTag,
  ContactTagAssignment,
} from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import { contactsService } from '@beabee/core/services/ContactsService';
import { normalizeEmailAddress } from '@beabee/core/utils/email';

import { parse } from 'csv-parse';
import * as fs from 'fs';
import { In } from 'typeorm';

const headers = [
  'first_name',
  'last_name',
  'email',
  'plan_name',
  'plan_monthly_amount_cents',
  'gifted',
  'subscription_period',
  'subscription_state',
  'subscribed_at',
  'trial_ends_at',
  'cancelled_at',
  'expires_at',
  'shipping_first_name',
  'shipping_last_name',
  'shipping_company_name',
  'shipping_street_and_number',
  'shipping_city',
  'shipping_zip_code',
  'shipping_state',
  'shipping_country_code',
] as const;

interface SteadyRow {
  first_name: string;
  last_name: string;
  email: string;
  plan_name: string;
  plan_monthly_amount_cents: number;
  gifted: boolean;
  subscription_period: 'annual' | 'monthly';
  subscription_state: string;
  subscribed_at: string;
  trial_ends_at: string;
  cancelled_at: string;
  expires_at: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_company_name: string;
  shipping_street_and_number: string;
  shipping_city: string;
  shipping_zip_code: string;
  shipping_state: string;
  shipping_country_code: string;
}

type RawSteadyRow = { [k in keyof SteadyRow]: string };

/**
 * Check if a row is a valid Steady row
 *
 * @param row  A row from the CSV file
 * @returns  Whether the row is valid
 */
function isSteadyRow(row: any): row is RawSteadyRow {
  return (
    typeof row === 'object' &&
    headers.every((header) => typeof row[header] === 'string') &&
    ['true', 'false'].includes(row.gifted) &&
    ['annual', 'monthly'].includes(row.subscription_period) &&
    !isNaN(parseInt(row.plan_monthly_amount_cents))
  );
}

/**
 * Convert Steady's period to beabee's period
 *
 * @param period Steady's period
 * @returns beabee's period
 */
function convertPeriod(period: 'annual' | 'monthly'): ContributionPeriod {
  return period === 'annual'
    ? ContributionPeriod.Annually
    : ContributionPeriod.Monthly;
}

/**
 * Create a contact role from a Steady row
 *
 * @param row Steady row data
 * @returns ContactRole entity
 */
function getRole(row: SteadyRow): ContactRole {
  return getRepository(ContactRole).create({
    type: 'member',
    dateAdded: new Date(row.subscribed_at),
    dateExpires: row.expires_at ? new Date(row.expires_at) : null,
  });
}

/**
 * Get delivery address and opt in from a row
 *
 * @param row Steady row data
 * @returns [deliveryOptIn, deliveryAddress]
 */
function getDeliveryAddress(row: SteadyRow): [boolean, Address | null] {
  if (row.shipping_street_and_number) {
    return [
      true,
      {
        line1: row.shipping_company_name || row.shipping_street_and_number,
        line2: row.shipping_company_name ? row.shipping_street_and_number : '',
        city: row.shipping_city,
        postcode: row.shipping_zip_code,
      },
    ];
  } else {
    return [false, null];
  }
}

/**
 * Set contribution data for a contact from a Steady row
 *
 * @param contact Contact to update
 * @param row Steady row data
 */
async function setContributionData(contact: Contact, row: SteadyRow) {
  const period = convertPeriod(row.subscription_period);

  await contactsService.forceUpdateContactContribution(contact, {
    type: ContributionType.Manual,
    source: 'Steady',
    reference: row.plan_name,
    period,
    amount:
      (row.plan_monthly_amount_cents / 100) *
      (period === ContributionPeriod.Annually ? 12 : 1),
  });
}

/**
 * Update an existing contact from a row
 *
 * @param contact Contact to update
 * @param row Steady row data
 * @param steadyTagId The ID of the Steady tag
 * @param dryRun If true, only logs what would be done
 */
async function updateExistingContact(
  contact: Contact,
  row: SteadyRow,
  steadyTagId: string,
  dryRun: boolean
) {
  if (contact.contributionType !== ContributionType.Manual) {
    console.error(
      `${contact.email} has contribution type ${contact.contributionType}, can't update`
    );
    return;
  }

  console.log(`Updating ${contact.email}`);
  if (dryRun) {
    return;
  }

  await contactsService.updateContact(contact, {
    contributionMonthlyAmount: row.plan_monthly_amount_cents / 100,
    firstname: row.first_name,
    lastname: row.last_name,
  });

  // If the contact is already a member, use extend instead to ensure
  // the role expiry date isn't reduced
  const role = getRole(row);
  if (contact.membership?.isActive) {
    if (role.dateExpires) {
      await contactsService.extendContactRole(
        contact,
        'member',
        role.dateExpires
      );
    }
  } else {
    await contactsService.updateContactRole(contact, 'member', role);
  }

  const [deliveryOptIn, deliveryAddress] = getDeliveryAddress(row);
  await contactsService.updateContactProfile(contact, {
    deliveryOptIn,
    deliveryAddress,
  });

  // Add Steady tag
  await getRepository(ContactTagAssignment)
    .createQueryBuilder()
    .insert()
    .values({ contactId: contact.id, tagId: steadyTagId })
    .orIgnore()
    .execute();

  await setContributionData(contact, row);
}

/**
 * Create a new contact from a row
 *
 * @param row A row from the CSV file
 * @param steadyTagId The ID of the Steady tag
 * @param dryRun If true, only logs what would be done
 */
async function addNewContact(
  row: SteadyRow,
  steadyTagId: string,
  dryRun: boolean
) {
  const joined = new Date(row.subscribed_at);

  const [deliveryOptIn, deliveryAddress] = getDeliveryAddress(row);

  console.log(`Adding ${row.email}`);
  if (dryRun) {
    return;
  }

  const contact = await contactsService.createContact(
    {
      email: row.email,
      firstname: row.first_name,
      lastname: row.last_name,
      joined,
      roles: [getRole(row)],
    },
    {
      deliveryOptIn,
      deliveryAddress,
      newsletterStatus: NewsletterStatus.None,
    }
  );

  // Add Steady tag
  await getRepository(ContactTagAssignment)
    .createQueryBuilder()
    .insert()
    .values({ contactId: contact.id, tagId: steadyTagId })
    .orIgnore()
    .execute();

  await setContributionData(contact, row);
}

/**
 * Process all rows from the CSV file, adding new contacts and updating existing ones
 *
 * @param rows All validated rows from the CSV file
 * @param dryRun If true, only logs what would be done
 */
async function processRows(rows: SteadyRow[], dryRun: boolean) {
  console.log(`Processing ${rows.length} rows`);

  // Check if steady tag exists and create if it doesn't
  let steadyTag = await getRepository(ContactTag).findOne({
    where: { name: 'Steady' },
  });

  if (!steadyTag && !dryRun) {
    steadyTag = await getRepository(ContactTag).save({
      name: 'Steady',
      description: 'Imported from Steady',
    });
  }

  if (!steadyTag) {
    console.log('Steady tag will be created when not in dry run mode');
    // In dry run mode, create a dummy tag ID for logging purposes
    steadyTag = { id: 'dummy-tag-id' } as ContactTag;
  }

  const existingContacts = await getRepository(Contact).find({
    where: { email: In(rows.map((row) => row.email)) },
  });

  const existingEmails = existingContacts.map((c) => c.email);

  let added = 0,
    updated = 0;

  for (const contact of existingContacts) {
    const row = rows.find((r) => r.email === contact.email) as SteadyRow;
    await updateExistingContact(contact, row, steadyTag.id, dryRun);
    updated++;
  }

  for (const row of rows) {
    if (!existingEmails.includes(row.email)) {
      await addNewContact(row, steadyTag.id, dryRun);
      added++;
    }
  }

  console.log(`Added ${added} contacts, updated ${updated} contacts`);
}

/**
 * Load rows from CSV file
 *
 * @param filePath Path to CSV file
 * @returns Promise resolving to validated Steady rows
 */
async function loadRows(filePath: string): Promise<SteadyRow[]> {
  return new Promise((resolve, reject) => {
    const rows: SteadyRow[] = [];
    const fileStream = fs.createReadStream(filePath);

    fileStream
      .pipe(parse({ columns: true, skipEmptyLines: true }))
      .on('data', (row) => {
        if (isSteadyRow(row)) {
          rows.push({
            ...row,
            email: normalizeEmailAddress(row.email),
            plan_monthly_amount_cents: parseInt(row.plan_monthly_amount_cents),
            gifted: row.gifted === 'true',
            subscription_period: row.subscription_period as
              | 'annual'
              | 'monthly',
          });
        } else {
          console.error('Invalid row', row);
        }
      })
      .on('end', () => resolve(rows))
      .on('error', (error) => reject(error));
  });
}

/**
 * Import contacts from Steady CSV export
 *
 * @param filePath Path to the CSV file exported from Steady
 * @param dryRun If true, only logs what would be done without making changes
 */
export const importSteady = async (
  filePath: string,
  dryRun = false
): Promise<void> => {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  await runApp(async () => {
    const rows = await loadRows(filePath);
    await processRows(rows, dryRun);
    console.log('Import completed successfully');
  });
};
