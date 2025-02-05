import {
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact
} from "#type/index";

export default class NoneProvider implements NewsletterProvider {
  async addTagToContacts(emails: string[], tag: string): Promise<void> {}
  async removeTagFromContacts(emails: string[], tag: string): Promise<void> {}
  async getContact(email: string): Promise<NewsletterContact | undefined> {
    return;
  }
  async getContacts(): Promise<NewsletterContact[]> {
    return [];
  }
  async upsertContact(
    contact: UpdateNewsletterContact,
    oldEmail?: string
  ): Promise<NewsletterContact> {
    return { ...contact, joined: new Date(), tags: [] };
  }
  async upsertContacts(contacts: UpdateNewsletterContact[]): Promise<void> {}
  async archiveContacts(emails: string[]): Promise<void> {}
  async permanentlyDeleteContacts(emails: string[]): Promise<void> {}
  async updateContactFields(
    email: string,
    fields: Record<string, string>
  ): Promise<void> {}
  async updateContactTags(
    email: string,
    tags: Record<string, boolean>
  ): Promise<void> {}
}
