import {
  ApiHealthStatus,
  BaseNewsletterGroupData,
  SalesforceNewsletterIntegrationData,
} from '@beabee/beabee-common';

import axios from 'axios';

import { SalesforceNewsletterConfig } from '#config/config';
import { CantUpdateNewsletterContactError } from '#errors/index';
import {
  PROFILE_ID_FIELD,
  PROFILE_OBJECT,
  createContact,
  createInstance,
  findContactIdByEmail,
  findProfileByBeabeeId,
  findProfileByEmail,
  getProfileById,
  getProfileFieldNames,
  nlContactToSFFields,
  sfProfileToNlContact,
} from '#lib/salesforce';
import { log as mainLogger } from '#logging';
import OptionsService from '#services/OptionsService';
import {
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
} from '#type/index';

const log = mainLogger.child({ app: 'salesforce-provider' });

/**
 * Syncs beabee contacts to beabee_Profile__c records in Salesforce. Each
 * profile is keyed on the beabee contact ID and is a master-detail child of a
 * Contact, which is matched by email or created on first sync.
 */
export class SalesforceProvider implements NewsletterProvider {
  private readonly api;
  private readonly settings;
  private readonly fieldNames;

  constructor(settings: SalesforceNewsletterConfig['settings']) {
    this.api = createInstance(settings);
    this.settings = settings;
    this.fieldNames = getProfileFieldNames(settings);
  }

  /**
   * Get the newsletter contact with the given email address
   *
   * @param email The email address of the contact
   * @returns The contact or undefined if not found
   */
  async getContact(email: string): Promise<NewsletterContact | undefined> {
    try {
      const record = await findProfileByEmail(
        this.api.instance,
        email,
        this.fieldNames
      );
      return record ? sfProfileToNlContact(record, this.settings) : undefined;
    } catch (err) {
      log.error('Error fetching Salesforce profile ' + email, err);
      return undefined;
    }
  }

  /**
   * Upsert a newsletter contact to Salesforce. Patches the profile with the
   * matching beabee ID, otherwise creates one under the Contact with the same
   * email, creating that Contact too if needed.
   *
   * @param contact The newsletter contact to upsert
   * @returns The updated newsletter contact, read back from Salesforce
   */
  async upsertContact(
    contact: UpdateNewsletterContact
  ): Promise<NewsletterContact> {
    log.info('Upsert contact ' + contact.email);

    if (!contact.id) {
      throw new Error(
        'Salesforce upsert needs a beabee ID for ' + contact.email
      );
    }

    const fields = nlContactToSFFields(contact, this.settings);

    try {
      const existing = await findProfileByBeabeeId(
        this.api.instance,
        contact.id,
        ['Id']
      );

      let id: string;
      if (existing) {
        id = existing.Id;
        await this.api.instance.patch(
          `sobjects/${PROFILE_OBJECT}/${id}`,
          fields
        );
      } else {
        const contactId =
          (await findContactIdByEmail(this.api.instance, contact.email)) ??
          (await createContact(this.api.instance, contact));
        const resp = await this.api.instance.post<{ id: string }>(
          `sobjects/${PROFILE_OBJECT}`,
          {
            ...fields,
            [PROFILE_ID_FIELD]: contact.id,
            Contact_bee__c: contactId,
          }
        );
        id = resp.data.id;
      }

      const record = await getProfileById(
        this.api.instance,
        id,
        this.fieldNames
      );
      return sfProfileToNlContact(record, this.settings);
    } catch (err) {
      const status = axios.isAxiosError(err)
        ? (err.response?.status ?? 500)
        : 500;
      const data = axios.isAxiosError(err) ? err.response?.data : undefined;
      throw new CantUpdateNewsletterContactError(contact.email, status, data);
    }
  }

  /**
   * Update a contact's group flags. Tag names are interpreted as beabee group
   * IDs and translated to their Salesforce boolean fields via the configured
   * group field map. Unmapped tags are ignored.
   *
   * @param email The email address of the contact
   * @param tags The tags to set
   */
  async updateContactTags(
    email: string,
    tags: Record<string, boolean>
  ): Promise<void> {
    const fields: Record<string, boolean> = {};
    for (const [tag, active] of Object.entries(tags)) {
      const sfField = this.settings.groupFieldMap[tag];
      if (sfField) {
        fields[sfField] = active;
      } else {
        log.info(`Ignoring unmapped Salesforce tag "${tag}" for ${email}`);
      }
    }
    if (Object.keys(fields).length) {
      await this.patchByEmail(email, fields);
    }
  }

  /**
   * Update a contact's fields, translating each key through the configured
   * merge field map (falling back to the raw key if unmapped).
   *
   * @param email The email address of the contact
   * @param fields The fields to update
   */
  async updateContactFields(
    email: string,
    fields: Record<string, string>
  ): Promise<void> {
    const sfFields: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      sfFields[this.settings.mergeFieldMap[key] || key] = value;
    }
    await this.patchByEmail(email, sfFields);
  }

  /**
   * Delete the contact's profile record. The parent Contact is left as is.
   *
   * @param email The email address of the contact
   */
  async permanentlyDeleteContact(email: string): Promise<void> {
    const existing = await findProfileByEmail(this.api.instance, email, ['Id']);
    if (!existing) {
      log.info('No Salesforce profile found for ' + email);
      return;
    }
    await this.api.instance.delete(`sobjects/${PROFILE_OBJECT}/${existing.Id}`);
  }

  /**
   * Get information about the Salesforce integration. Groups come from the
   * options table (newsletter-groups), matching the Mailchimp provider.
   *
   * @param withHealth Whether to include the health status
   */
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

  /**
   * Get the available newsletter groups. Salesforce has no groups API — groups
   * are just the configured boolean fields — so the group IDs are returned
   * directly from the config.
   */
  async getGroups(): Promise<BaseNewsletterGroupData[]> {
    return Object.keys(this.settings.groupFieldMap).map((id) => ({
      id,
      label: id,
    }));
  }

  /**
   * Check the Salesforce integration is healthy by hitting the limits endpoint,
   * which exercises authentication and reachability cheaply.
   */
  private async getHealthStatus(): Promise<ApiHealthStatus> {
    try {
      await this.api.instance.get('limits/');
      return ApiHealthStatus.HEALTHY;
    } catch (err) {
      log.error('Salesforce health check failed', err);
      return ApiHealthStatus.UNHEALTHY;
    }
  }

  /**
   * Find a profile by email and patch it with the given fields. No-op if no
   * matching profile exists.
   *
   * @param email The email address of the contact
   * @param fields The Salesforce fields to patch
   */
  private async patchByEmail(
    email: string,
    fields: Record<string, unknown>
  ): Promise<void> {
    const existing = await findProfileByEmail(this.api.instance, email, ['Id']);
    if (!existing) {
      log.info('No Salesforce profile found for ' + email);
      return;
    }
    await this.api.instance.patch(
      `sobjects/${PROFILE_OBJECT}/${existing.Id}`,
      fields
    );
  }
}
