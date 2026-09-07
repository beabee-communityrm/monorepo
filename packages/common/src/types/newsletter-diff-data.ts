import type { NewsletterIntegrationDataWith } from './get-newsletter-integration-data-with.js';
import type { BaseNewsletterGroupData } from './newsletter-group-data.js';

export interface GroupChanges extends BaseNewsletterGroupData {
  action: 'added' | 'removed';
}

export interface NewsletterDiffData {
  info: NewsletterIntegrationDataWith<'health'>;
  groupChanges: GroupChanges[];
}
