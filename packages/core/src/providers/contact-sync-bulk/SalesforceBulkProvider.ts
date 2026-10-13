import { SalesforceContactSyncConfig } from '#config/config';
import {
  PROFILE_ID_FIELD,
  PROFILE_OBJECT,
  contactToProfileFields,
  createInstance,
} from '#lib/salesforce';
import type { Contact } from '#models/index';
import type { ContactSyncBulkProvider, ContactSyncFailure } from '#type/index';

/** The most records one sObject Collections request accepts */
const BATCH_SIZE = 200;

interface SFCollectionResult {
  success: boolean;
  errors: { statusCode: string; message: string }[];
}

/**
 * Upserts beabee_Profile__c records through the sObject Collections resource,
 * which takes up to 200 records per request and counts as one API call.
 */
export class SalesforceBulkProvider implements ContactSyncBulkProvider {
  private readonly api;

  constructor(settings: SalesforceContactSyncConfig['settings']) {
    this.api = createInstance(settings);
  }

  async upsertContacts(contacts: Contact[]): Promise<ContactSyncFailure[]> {
    const failures: ContactSyncFailure[] = [];

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE);
      const resp = await this.api.patch<SFCollectionResult[]>(
        `composite/sobjects/${PROFILE_OBJECT}/${PROFILE_ID_FIELD}`,
        {
          allOrNone: false,
          records: batch.map((contact) => ({
            attributes: { type: PROFILE_OBJECT },
            [PROFILE_ID_FIELD]: contact.id,
            ...contactToProfileFields(contact),
          })),
        }
      );

      resp.data.forEach((result, j) => {
        if (!result.success) {
          failures.push({
            contactId: batch[j].id,
            error: result.errors.map((e) => e.message).join('; '),
          });
        }
      });
    }

    return failures;
  }
}
