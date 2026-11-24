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
 * by the beabee contact ID. Groups are checkboxes on the profile. When the
 * contact sync provider is also Salesforce it owns the record's deletion.
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
        status: NewsletterStatus.None,
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
    try {
      await this.api.patch(profileUrl(key), {
        ...identityFields(contact),
        ...groupFields(contact),
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
    // The upsert response carries no fields, so read the resulting groups back
    const resp = await this.api.get(profileUrl(key));
    return {
      ...contact,
      groups: GROUPS.filter((g) => resp.data[g.field]).map((g) => g.id),
      joined: new Date(resp.data.CreatedDate),
      tags: [],
    };
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

/**
 * The group checkboxes an update sets. A partial change only touches the
 * groups it names; a replace sets every group.
 */
function groupFields(
  contact: UpdateNewsletterContact
): Record<string, boolean> {
  const groups = contact.groups;
  if (!groups) return {};

  const unknown = groups.filter((id) => !GROUPS.some((g) => g.id === id));
  if (unknown.length > 0) {
    throw new CantUpdateNewsletterGroupsError(
      `Unknown newsletter groups: ${unknown.join(', ')}`
    );
  }

  const change = contact.newsletterGroupChange ?? 'replace';
  const touched =
    change === 'replace' ? GROUPS : GROUPS.filter((g) => groups.includes(g.id));
  return Object.fromEntries(
    touched.map((g) => [g.field, change !== 'remove' && groups.includes(g.id)])
  );
}
