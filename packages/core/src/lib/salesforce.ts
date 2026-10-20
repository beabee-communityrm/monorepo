import axios, { AxiosInstance } from 'axios';

import { SalesforceContactSyncConfig, config } from '#config/config';
import { log as mainLogger } from '#logging';
import type { Contact, ContactProfile } from '#models/index';
import type { SFTokenResponse } from '#type/index';

const log = mainLogger.child({ app: 'salesforce' });

type SFSettings = SalesforceContactSyncConfig['settings'];

export const PROFILE_OBJECT = 'beabee_Profile__c';
/** External ID on the profile object holding the beabee contact ID. */
export const PROFILE_ID_FIELD = 'beabeeID_bee__c';

/**
 * Create a Salesforce REST client. Handles OAuth2 client-credentials token
 * acquisition and in-memory caching, injecting the bearer token and the
 * instance base URL on every request. On a 401 the cached token is cleared and
 * the request is retried once.
 *
 * @param settings The Salesforce settings
 * @returns The configured axios instance
 */
export function createInstance(settings: SFSettings): AxiosInstance {
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

  return instance;
}

/** The contact fields that feed `contactToProfileFields`. */
export const SYNCED_CONTACT_FIELDS: ReadonlySet<string> = new Set([
  'email',
  'firstname',
  'lastname',
] satisfies (keyof Contact)[]);

/** The profile fields that feed `contactToProfileFields`. */
export const SYNCED_PROFILE_FIELDS: ReadonlySet<string> = new Set([
  'deliveryAddress',
] satisfies (keyof ContactProfile)[]);

/**
 * Map a contact to its beabee_Profile__c fields. Text values are cut to the
 * field lengths in Salesforce so an overlong value can't fail the whole sync.
 *
 * @param contact The contact, with its profile loaded
 * @returns A record of Salesforce field API names to values
 */
export function contactToProfileFields(
  contact: Contact
): Record<string, unknown> {
  const address = contact.profile.deliveryAddress;
  const name =
    `${contact.firstname} ${contact.lastname}`.trim() || contact.email;

  return {
    Name: name.slice(0, 80),
    EMail_bee__c: contact.email,
    FirstName_bee__c: contact.firstname.slice(0, 40),
    LastName_bee__c: contact.lastname.slice(0, 50),
    ProfileCreateDate_bee__c: contact.joined.toISOString(),
    LastLogin_bee__c: null,
    beabeeProfileLink_bee__c: `${config.audience}/admin/contacts/${contact.id}`,
    MailingStreet_bee__c: address
      ? [address.line1, address.line2].filter(Boolean).join('\n').slice(0, 100)
      : null,
    MailingCity_bee__c: address?.city.slice(0, 100) ?? null,
    MailingPostcode_bee__c: address?.postcode.slice(0, 12) ?? null,
    MailingCountry_bee__c: address?.country?.slice(0, 100) ?? null,
  };
}
