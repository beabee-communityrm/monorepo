import {
  ApiHealthStatus,
  BaseNewsletterGroupData,
  NewsletterStatus,
  SalesforceNewsletterIntegrationData,
} from '@beabee/beabee-common';

import axios from 'axios';

import { SalesforceNewsletterConfig, config } from '#config/config';
import {
  CantUpdateNewsletterContactError,
  CantUpdateNewsletterGroupsError,
} from '#errors/index';
import {
  PROFILE_OBJECT,
  createInstance,
  identityFields,
  profileUrl,
} from '#lib/salesforce';
import { log as mainLogger } from '#logging';
import type { Contact } from '#models/index';
import OptionsService from '#services/OptionsService';
import {
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
} from '#type/index';

const log = mainLogger.child({ app: 'salesforce-newsletter-provider' });

/** The newsletter groups, each backed by a checkbox on the profile */
const GROUPS = [
  { id: 'spotlight', label: 'Spotlight', field: 'Spotlight_bee__c' },
  { id: 'updates', label: 'Updates', field: 'Receive_Updates__c' },
];

/**
 * Writes newsletter state to the contact's beabee_Profile__c record, addressed
 * by the beabee contact ID. Groups are checkboxes on the profile, and the
 * double opt-in date is set when the contact becomes subscribed. beabee is the
 * only writer of these fields, so the resulting state is computed from the
 * update rather than read back. When the contact sync provider is also
 * Salesforce it owns the record's deletion.
 */
export class SalesforceProvider implements NewsletterProvider {
  private readonly api;
  private readonly ownsProfile = config.contactSync.provider !== 'salesforce';

  constructor(settings: SalesforceNewsletterConfig['settings']) {
    this.api = createInstance(settings);
  }

  getContactKey(contact: Pick<Contact, 'id' | 'email'>): string {
    return contact.id;
  }

  async getContact(key: string): Promise<NewsletterContact | undefined> {
    try {
      const resp = await this.api.get(profileUrl(key));
      return {
        email: resp.data.EMail_bee__c,
        firstname: resp.data.FirstName_bee__c ?? '',
        lastname: resp.data.LastName_bee__c ?? '',
        status: resp.data.DOIDate_bee__c
          ? NewsletterStatus.Subscribed
          : NewsletterStatus.None,
        groups: GROUPS.filter((g) => resp.data[g.field]).map((g) => g.id),
        joined: new Date(resp.data.CreatedDate),
        tags: [],
        fields: {},
        isActiveMember: false,
        isActiveUser: false,
      };
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return undefined;
      }
      throw err;
    }
  }

  async upsertContact(
    contact: UpdateNewsletterContact,
    key: string,
    oldKey = key
  ): Promise<NewsletterContact> {
    log.info('Upsert contact ' + key);
    const groups = applyGroupChange(contact);
    const newlySubscribed =
      contact.status === NewsletterStatus.Subscribed &&
      contact.previous?.status !== NewsletterStatus.Subscribed;
    try {
      await this.api.patch(profileUrl(key), {
        ...identityFields(contact),
        ...Object.fromEntries(
          GROUPS.map((g) => [g.field, groups.includes(g.id)])
        ),
        ...(newlySubscribed && {
          DOIDate_bee__c: new Date().toISOString().slice(0, 10),
        }),
        // The flow linking profiles to contacts only runs on this status
        Sync_Status__c: 'Updated',
      });
    } catch (err) {
      if (!axios.isAxiosError(err)) throw err;
      throw new CantUpdateNewsletterContactError(
        contact.email,
        err.response?.status ?? 500,
        err.response?.data
      );
    }
    return { ...contact, groups, joined: new Date(), tags: [] };
  }

  async updateContactTags(
    key: string,
    tags: Record<string, boolean>
  ): Promise<void> {}

  async updateContactFields(
    key: string,
    fields: Record<string, string>
  ): Promise<void> {}

  async permanentlyDeleteContact(key: string): Promise<void> {
    if (!this.ownsProfile) return;
    try {
      await this.api.delete(profileUrl(key));
    } catch (err) {
      // A contact that was never synced has no profile to delete
      if (!(axios.isAxiosError(err) && err.response?.status === 404)) {
        throw err;
      }
    }
  }

  async getProviderInfo(
    withHealth = false
  ): Promise<SalesforceNewsletterIntegrationData> {
    const resp: SalesforceNewsletterIntegrationData = {
      provider: 'salesforce',
      audienceId: PROFILE_OBJECT,
      groups: OptionsService.getJSON('newsletter-groups'),
    };
    if (withHealth) {
      resp.status = await this.getHealthStatus();
    }
    return resp;
  }

  async getGroups(): Promise<BaseNewsletterGroupData[]> {
    return GROUPS.map(({ id, label }) => ({ id, label }));
  }

  private async getHealthStatus(): Promise<ApiHealthStatus> {
    try {
      await this.api.get('limits/');
      return ApiHealthStatus.HEALTHY;
    } catch (err) {
      log.error('Salesforce health check failed', err);
      return ApiHealthStatus.UNHEALTHY;
    }
  }
}

/** The contact's groups after the update is applied to their previous groups */
function applyGroupChange(contact: UpdateNewsletterContact): string[] {
  const current = contact.previous?.groups ?? [];
  const groups = contact.groups;
  if (!groups) return current;

  const unknown = groups.filter((id) => !GROUPS.some((g) => g.id === id));
  if (unknown.length > 0) {
    throw new CantUpdateNewsletterGroupsError(
      `Unknown newsletter groups: ${unknown.join(', ')}`
    );
  }

  switch (contact.newsletterGroupChange) {
    case 'add':
      return [...new Set([...current, ...groups])];
    case 'remove':
      return current.filter((id) => !groups.includes(id));
    default:
      return groups;
  }
}
