import type { NewsletterIntegrationDataWith } from './get-newsletter-integration-data-with.js';

export interface GroupChanges {
  id: string;
  label: string;
  action: 'added' | 'removed';
}

export interface NewsletterDiffData {
  info: NewsletterIntegrationDataWith<'health'>;
  groupChanges: GroupChanges[];
}
