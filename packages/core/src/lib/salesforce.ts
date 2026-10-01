import { Address, NewsletterStatus } from '@beabee/beabee-common';

import axios, { AxiosInstance } from 'axios';

import { SalesforceNewsletterConfig, config } from '#config/config';
import { log as mainLogger } from '#logging';
import {
  NewsletterContact,
  NewsletterGroupChange,
  SFProfileRecord,
  SFTokenResponse,
  UpdateNewsletterContact,
} from '#type/index';
import { normalizeEmailAddress } from '#utils/email';

const log = mainLogger.child({ app: 'salesforce' });

type SFSettings = SalesforceNewsletterConfig['settings'];

export const PROFILE_OBJECT = 'beabee_Profile__c';
/** External ID on the profile object holding the beabee contact ID. */
export const PROFILE_ID_FIELD = 'beabeeID_bee__c';

/** Fixed profile fields we always read back. */
const BASE_FIELDS = [
  'Id',
  'CreatedDate',
  PROFILE_ID_FIELD,
  'EMail_bee__c',
  'FirstName_bee__c',
  'LastName_bee__c',
];

/**
 * The profile field API names to select for a full NewsletterContact: the
 * fixed fields plus every configured mapping.
 *
 * @param settings The Salesforce newsletter settings
 * @returns The de-duplicated list of field API names
 */
export function getProfileFieldNames(settings: SFSettings): string[] {
  const fields = new Set(BASE_FIELDS);
  fields.add(settings.subscriptionField);
  Object.values(settings.groupFieldMap).forEach((f) => fields.add(f));
  Object.values(settings.mergeFieldMap).forEach((f) => fields.add(f));
  if (settings.activeMemberField) fields.add(settings.activeMemberField);
  if (settings.activeUserField) fields.add(settings.activeUserField);
  return [...fields];
}

/**
 * Escape a value for safe interpolation into a SOQL string literal. SOQL has no
 * parameterised queries, so backslashes and single quotes must be escaped.
 *
 * @param value The raw value
 * @returns The escaped value
 */
function escapeSOQL(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Create a Salesforce REST client. Handles OAuth2 client-credentials token
 * acquisition and in-memory caching, injecting the bearer token and the
 * instance base URL on every request. On a 401 the cached token is cleared and
 * the request is retried once.
 *
 * @param settings The Salesforce newsletter settings
 * @returns An object with the configured axios instance
 */
export function createInstance(settings: SFSettings) {
  let token: SFTokenResponse | undefined;

  async function fetchToken(): Promise<SFTokenResponse> {
    log.info('Fetching Salesforce access token');
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: settings.clientId,
      client_secret: settings.clientSecret,
    });
    const resp = await axios.post<SFTokenResponse>(settings.authUrl, body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return resp.data;
  }

  async function getToken(): Promise<SFTokenResponse> {
    if (!token) token = await fetchToken();
    return token;
  }

  const instance = axios.create();

  instance.interceptors.request.use(async (config) => {
    const t = await getToken();
    config.baseURL = `${t.instance_url}/services/data/${settings.apiVersion}/`;
    config.headers.set('Authorization', `Bearer ${t.access_token}`);
    log.info(`${config.method} ${config.url}`, { params: config.params });
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const original = error.config;
      // Retry once with a fresh token if the cached one has expired
      if (status === 401 && original && !original._sfRetried) {
        log.info('Salesforce token expired, refreshing');
        token = undefined;
        original._sfRetried = true;
        return instance.request(original);
      }
      log.error('Salesforce API returned with status ' + status, {
        status,
        data: error.response?.data,
      });
      return Promise.reject(error);
    }
  );

  return { instance };
}

/**
 * Find a profile by email address, selecting the given fields.
 *
 * @param instance The Salesforce axios instance
 * @param email The email address to look up
 * @param fields The field API names to select
 * @returns The first matching record, or undefined if none
 */
export async function findProfileByEmail(
  instance: AxiosInstance,
  email: string,
  fields: string[]
): Promise<SFProfileRecord | undefined> {
  const soql =
    `SELECT ${fields.join(', ')} FROM ${PROFILE_OBJECT} ` +
    `WHERE EMail_bee__c = '${escapeSOQL(normalizeEmailAddress(email))}' LIMIT 1`;
  const resp = await instance.get<{ records: SFProfileRecord[] }>('query/', {
    params: { q: soql },
  });
  return resp.data.records[0];
}

/**
 * Find a profile by its beabee contact ID (the external ID field).
 *
 * @param instance The Salesforce axios instance
 * @param beabeeId The beabee contact ID
 * @param fields The field API names to select
 * @returns The record, or undefined if none
 */
export async function findProfileByBeabeeId(
  instance: AxiosInstance,
  beabeeId: string,
  fields: string[]
): Promise<SFProfileRecord | undefined> {
  try {
    const resp = await instance.get<SFProfileRecord>(
      `sobjects/${PROFILE_OBJECT}/${PROFILE_ID_FIELD}/${beabeeId}`,
      { params: { fields: fields.join(',') } }
    );
    return resp.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return undefined;
    }
    throw err;
  }
}

/**
 * Read a single profile by record ID, selecting the given fields.
 *
 * @param instance The Salesforce axios instance
 * @param id The profile record ID
 * @param fields The field API names to select
 * @returns The record
 */
export async function getProfileById(
  instance: AxiosInstance,
  id: string,
  fields: string[]
): Promise<SFProfileRecord> {
  const resp = await instance.get<SFProfileRecord>(
    `sobjects/${PROFILE_OBJECT}/${id}`,
    { params: { fields: fields.join(',') } }
  );
  return resp.data;
}

/**
 * Find the Salesforce Contact with the given email address.
 *
 * @param instance The Salesforce axios instance
 * @param email The email address to look up
 * @returns The Contact record ID, or undefined if none
 */
export async function findContactIdByEmail(
  instance: AxiosInstance,
  email: string
): Promise<string | undefined> {
  const soql = `SELECT Id FROM Contact WHERE Email = '${escapeSOQL(normalizeEmailAddress(email))}' LIMIT 1`;
  const resp = await instance.get<{ records: { Id: string }[] }>('query/', {
    params: { q: soql },
  });
  return resp.data.records[0]?.Id;
}

/**
 * Create a Salesforce Contact for a newsletter contact. LastName is mandatory
 * on Contact, so the email address is used when beabee has no last name.
 *
 * @param instance The Salesforce axios instance
 * @param contact The newsletter contact
 * @returns The new Contact record ID
 */
export async function createContact(
  instance: AxiosInstance,
  contact: UpdateNewsletterContact
): Promise<string> {
  const resp = await instance.post<{ id: string }>('sobjects/Contact', {
    FirstName: contact.firstname,
    LastName: contact.lastname || contact.email,
    Email: contact.email,
  });
  return resp.data.id;
}

/**
 * Build the group boolean fields for a groups update.
 *
 * - 'add'/'remove': only the listed groups are included, set true/false
 *   respectively, every other group field is left untouched.
 * - 'replace' (default): every configured group field is included, set to
 *   true only if it's in `groups`.
 *
 * @param groups The group IDs the update concerns
 * @param change How `groups` should be applied
 * @param settings The Salesforce newsletter settings
 * @returns A record of Salesforce field API names to booleans
 */
function buildGroupFields(
  groups: string[],
  change: NewsletterGroupChange = 'replace',
  settings: SFSettings
): Record<string, boolean> {
  const fields: Record<string, boolean> = {};
  for (const [groupId, sfField] of Object.entries(settings.groupFieldMap)) {
    if (change === 'replace') {
      fields[sfField] = groups.includes(groupId);
    } else if (groups.includes(groupId)) {
      fields[sfField] = change === 'add';
    }
  }
  return fields;
}

/**
 * Build the mailing address fields. A missing address clears them. The street
 * field is capped at its Salesforce length so an overlong address can't fail
 * the whole sync.
 *
 * @param address The delivery address
 * @returns A record of Salesforce field API names to values
 */
function buildAddressFields(address: Address | null): Record<string, unknown> {
  return {
    MailingStreet_bee__c: address
      ? [address.line1, address.line2].filter(Boolean).join('\n').slice(0, 100)
      : null,
    MailingCity_bee__c: address?.city ?? null,
    MailingPostcode_bee__c: address?.postcode ?? null,
    MailingCountry_bee__c: address?.country ?? null,
  };
}

/**
 * Map a NewsletterContact to a set of profile fields using the configured
 * field mappings. Status is collapsed to the master subscription boolean
 * (Salesforce has no pending/cleaned concept). Group fields are only included
 * when the update concerns groups.
 *
 * @param contact The newsletter contact
 * @param settings The Salesforce newsletter settings
 * @returns A record of Salesforce field API names to values
 */
export function nlContactToSFFields(
  contact: UpdateNewsletterContact,
  settings: SFSettings
): Record<string, unknown> {
  const name =
    `${contact.firstname} ${contact.lastname}`.trim() || contact.email;

  const fields: Record<string, unknown> = {
    Name: name.slice(0, 80),
    EMail_bee__c: contact.email,
    FirstName_bee__c: contact.firstname,
    LastName_bee__c: contact.lastname,
    ...(contact.id && {
      beabeeProfileLink_bee__c: `${config.audience}/admin/contacts/${contact.id}`,
    }),
    ...(contact.joined && {
      ProfileCreateDate_bee__c: contact.joined.toISOString(),
    }),
    ...(contact.lastSeen !== undefined && {
      LastLogin_bee__c: contact.lastSeen?.toISOString() ?? null,
    }),
    ...(contact.deliveryAddress !== undefined &&
      buildAddressFields(contact.deliveryAddress)),
    [settings.subscriptionField]:
      contact.status === NewsletterStatus.Subscribed,
    ...(contact.groups &&
      buildGroupFields(
        contact.groups,
        contact.newsletterGroupChange,
        settings
      )),
  };

  for (const [key, sfField] of Object.entries(settings.mergeFieldMap)) {
    if (contact.fields[key] !== undefined) {
      fields[sfField] = contact.fields[key];
    }
  }

  if (settings.activeMemberField) {
    fields[settings.activeMemberField] = contact.isActiveMember;
  }
  if (settings.activeUserField) {
    fields[settings.activeUserField] = contact.isActiveUser;
  }

  return fields;
}

/**
 * Map a profile record back to a NewsletterContact. Salesforce only expresses
 * subscribed/unsubscribed, so status is derived from the master subscription
 * field.
 *
 * @param record The profile record
 * @param settings The Salesforce newsletter settings
 * @returns The newsletter contact
 */
export function sfProfileToNlContact(
  record: SFProfileRecord,
  settings: SFSettings
): NewsletterContact {
  const groups = Object.entries(settings.groupFieldMap)
    .filter(([, sfField]) => !!record[sfField])
    .map(([groupId]) => groupId);

  const fields: Record<string, string> = {};
  for (const [key, sfField] of Object.entries(settings.mergeFieldMap)) {
    const value = record[sfField];
    if (value !== undefined && value !== null) {
      fields[key] = String(value);
    }
  }

  return {
    email: normalizeEmailAddress(record.EMail_bee__c || ''),
    firstname: record.FirstName_bee__c || '',
    lastname: record.LastName_bee__c || '',
    joined: record.CreatedDate ? new Date(record.CreatedDate) : new Date(),
    status: record[settings.subscriptionField]
      ? NewsletterStatus.Subscribed
      : NewsletterStatus.Unsubscribed,
    groups,
    tags: [],
    fields,
    isActiveMember: settings.activeMemberField
      ? !!record[settings.activeMemberField]
      : false,
    isActiveUser: settings.activeUserField
      ? !!record[settings.activeUserField]
      : false,
  };
}
