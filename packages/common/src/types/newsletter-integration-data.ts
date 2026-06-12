import { ApiHealthStatus } from '../data/index.js';
import type { NewsletterGroupData } from './newsletter-group-data.js';

export interface NoneNewsletterIntegrationData {
  provider: 'none';
  status?: ApiHealthStatus.DISABLED;
}

export interface MailchimpNewsletterIntegrationData {
  provider: 'mailchimp';
  status?: ApiHealthStatus;
  audienceId: string;
  groups: NewsletterGroupData[];
}

export type NewsletterIntegrationData =
  | NoneNewsletterIntegrationData
  | MailchimpNewsletterIntegrationData;
