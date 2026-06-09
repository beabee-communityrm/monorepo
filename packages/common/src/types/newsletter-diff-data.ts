import type { NewsletterIntegrationData } from './newsletter-integration-data.js';

export interface GroupChanges {
  id: string;
  label: string;
  action: 'added' | 'removed';
}

export interface NewsletterDiffData {
  info: NewsletterIntegrationData;
  groupChanges: GroupChanges[];
}
