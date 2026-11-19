import {
  ApiHealthStatus,
  BaseNewsletterGroupData,
  NewsletterStatus,
  SalesforceNewsletterIntegrationData,
} from '@beabee/beabee-common';

import axios from 'axios';

import { SalesforceNewsletterConfig, config } from '#config/config';
import { CantUpdateNewsletterContactError } from '#errors/index';
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

/**
 * Writes newsletter state to the contact's beabee_Profile__c record, addressed
 * by the beabee contact ID. The profile holds no newsletter fields yet, so only
 * the identity fields are written. When the contact sync provider is also
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
        status: NewsletterStatus.None,
        groups: [],
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
      await this.api.patch(profileUrl(key), identityFields(contact));
    } catch (err) {
      if (!axios.isAxiosError(err)) throw err;
      throw new CantUpdateNewsletterContactError(
        contact.email,
        err.response?.status ?? 500,
        err.response?.data
      );
    }
    return {
      ...contact,
      groups: contact.groups ?? [],
      joined: new Date(),
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
    return [];
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
