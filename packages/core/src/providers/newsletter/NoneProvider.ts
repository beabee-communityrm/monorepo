import {
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
} from '#type/index';

export class NoneProvider implements NewsletterProvider {
  async getContact(email: string): Promise<NewsletterContact | undefined> {
    return;
  }
  async upsertContact(
    contact: UpdateNewsletterContact,
    oldEmail?: string
  ): Promise<NewsletterContact> {
    return { ...contact, joined: new Date(), tags: [] };
  }
  async permanentlyDeleteContact(email: string): Promise<void> {}
  async updateContactFields(
    email: string,
    fields: Record<string, string>
  ): Promise<void> {}
  async updateContactTags(
    email: string,
    tags: Record<string, boolean>
  ): Promise<void> {}
}

/** @deprecated Use named import NoneProvider instead */
export default NoneProvider;
