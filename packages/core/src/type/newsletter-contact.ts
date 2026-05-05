import type { UpdateNewsletterContact } from './update-newsletter-contact.js';

export interface NewsletterContact extends UpdateNewsletterContact {
  joined: Date;
  tags: string[];
}
