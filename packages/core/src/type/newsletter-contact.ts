import { UpdateNewsletterContact } from './update-newsletter-contact.js';

export interface NewsletterContact extends UpdateNewsletterContact {
  groups: string[];
  joined: Date;
  tags: string[];
}
