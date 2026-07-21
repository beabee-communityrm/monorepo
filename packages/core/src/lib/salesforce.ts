import { NewsletterStatus } from '@beabee/beabee-common';

import axios, { AxiosInstance } from 'axios';

import { SalesforceNewsletterConfig } from '#config/config';
import { log as mainLogger } from '#logging';
import {
  NewsletterContact,
  SFContactRecord,
  SFTokenResponse,
  UpdateNewsletterContact,
} from '#type/index';
import { normalizeEmailAddress } from '#utils/email';

const log = mainLogger.child({ app: 'salesforce' });

type SFSettings = SalesforceNewsletterConfig['settings'];

/** Standard Contact fields we always read back. */
const BASE_FIELDS = ['Id', 'Email', 'FirstName', 'LastName', 'CreatedDate'];

/**
 * The Salesforce Contact field API names to select for a full NewsletterContact:
 * the standard fields plus every configured mapping.
 *
 * @param settings The Salesforce newsletter settings
 * @returns The de-duplicated list of field API names
 */
export function getContactFieldNames(settings: SFSettings): string[] {
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
 * Find a Salesforce Contact by email address, selecting the given fields.
 *
 * @param instance The Salesforce axios instance
 * @param email The email address to look up
 * @param fields The Contact field API names to select
 * @returns The first matching record, or undefined if none
 */
export async function findContactByEmail(
  instance: AxiosInstance,
  email: string,
  fields: string[]
): Promise<SFContactRecord | undefined> {
  const soql =
    `SELECT ${fields.join(', ')} FROM Contact ` +
    `WHERE Email = '${escapeSOQL(normalizeEmailAddress(email))}' LIMIT 1`;
  const resp = await instance.get<{ records: SFContactRecord[] }>('query/', {
    params: { q: soql },
  });
  return resp.data.records[0];
}

/**
 * Read a single Salesforce Contact by record ID, selecting the given fields.
 *
 * @param instance The Salesforce axios instance
 * @param id The Contact record ID
 * @param fields The Contact field API names to select
 * @returns The Contact record
 */
export async function getContactById(
  instance: AxiosInstance,
  id: string,
  fields: string[]
): Promise<SFContactRecord> {
  const resp = await instance.get<SFContactRecord>(`sobjects/Contact/${id}`, {
    params: { fields: fields.join(',') },
  });
  return resp.data;
}

/**
 * Map a NewsletterContact to a set of Salesforce Contact fields using the
 * configured field mappings. When the contact is not subscribed all group
 * booleans are set false (Salesforce has no pending/cleaned concept).
 *
 * @param contact The newsletter contact
 * @param settings The Salesforce newsletter settings
 * @returns A record of Salesforce field API names to values
 */
export function nlContactToSFFields(
  contact: UpdateNewsletterContact,
  settings: SFSettings
): Record<string, unknown> {
  const subscribed = contact.status === NewsletterStatus.Subscribed;

  const fields: Record<string, unknown> = {
    FirstName: contact.firstname,
    LastName: contact.lastname,
    Email: contact.email,
    [settings.subscriptionField]: subscribed,
  };

  for (const [groupId, sfField] of Object.entries(settings.groupFieldMap)) {
    fields[sfField] = subscribed && contact.groups.includes(groupId);
  }

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
 * Map a Salesforce Contact record back to a NewsletterContact. Salesforce only
 * expresses subscribed/unsubscribed, so status is derived from the master
 * subscription field.
 *
 * @param record The Salesforce Contact record
 * @param settings The Salesforce newsletter settings
 * @returns The newsletter contact
 */
export function sfContactToNlContact(
  record: SFContactRecord,
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
    email: normalizeEmailAddress(record.Email || ''),
    firstname: record.FirstName || '',
    lastname: record.LastName || '',
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
