import {
  NewsletterBulkProvider,
  NewsletterContact,
  UpdateNewsletterContact,
} from '#type';

export class NoneBulkProvider implements NewsletterBulkProvider {
  async updateContactTags(): Promise<void> {}
  async getContacts(): Promise<NewsletterContact[]> {
    return [];
  }
  async upsertContacts(contacts: UpdateNewsletterContact[]): Promise<void> {}
  async archiveContacts(emails: string[]): Promise<void> {}
}
