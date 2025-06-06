import { UpdateNewsletterContact } from './update-newsletter-contact';

export interface NewsletterContact extends UpdateNewsletterContact {
  joined: Date;
  tags: string[];
}
