import type { NewsletterStatus } from '../data/index.js';

export interface ContactNewsletterData {
  status: NewsletterStatus;
  groups: string[];
}
