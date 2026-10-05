import axios from 'axios';

import { SalesforceContactSyncConfig } from '#config/config';
import {
  PROFILE_ID_FIELD,
  PROFILE_OBJECT,
  contactToProfileFields,
  createInstance,
  touchesProfileFields,
} from '#lib/salesforce';
import type { Contact, ContactProfile } from '#models/index';
import type { ContactSyncProvider } from '#type/index';

/**
 * Mirrors contacts to beabee_Profile__c records, keyed on the beabee contact
 * ID through the external ID field. Linking or creating the parent Contact
 * is handled on the Salesforce side.
 */
export class SalesforceProvider implements ContactSyncProvider {
  private readonly api;

  constructor(settings: SalesforceContactSyncConfig['settings']) {
    this.api = createInstance(settings);
  }

  async upsertContact(
    contact: Contact,
    updates?: Partial<Contact> | Partial<ContactProfile>
  ): Promise<void> {
    if (updates && !touchesProfileFields(updates)) return;
    await this.api.patch(
      `sobjects/${PROFILE_OBJECT}/${PROFILE_ID_FIELD}/${contact.id}`,
      contactToProfileFields(contact)
    );
  }

  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    try {
      await this.api.delete(
        `sobjects/${PROFILE_OBJECT}/${PROFILE_ID_FIELD}/${contact.id}`
      );
    } catch (err) {
      // A contact that was never synced has no profile to delete
      if (!(axios.isAxiosError(err) && err.response?.status === 404)) {
        throw err;
      }
    }
  }
}
