import type { NewsletterStatus } from '../data/index.js';
import type { Address } from './index.js';

export interface ContactProfileData {
  telephone: string;
  twitter: string;
  preferredContact: string;
  deliveryOptIn: boolean;
  deliveryAddress: Address | null;
  newsletterStatus: NewsletterStatus;
  newsletterGroups: string[];

  // Admin only
  notes?: string;
  description?: string;
}
