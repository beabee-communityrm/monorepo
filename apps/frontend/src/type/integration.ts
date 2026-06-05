import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { ApiHealthStatus } from '@beabee/beabee-common';
import type { NewsletterGroupData } from '@beabee/beabee-common';

export { ApiHealthStatus as IntegrationStatus };
export type { NewsletterGroupData as IntegrationGroupData };

/**
 * Display type used by integration card components.
 * Combines API data with frontend-mapped display properties.
 */
export interface Integration {
  provider: string;
  name: string;           // frontend-mapped from provider
  category: string;       // frontend-mapped from endpoint
  status: ApiHealthStatus;
  color: string;          // frontend-mapped
  textColor?: string;     // frontend-mapped
  icon?: IconDefinition;  // frontend-mapped
  audienceId?: string;
  groups?: NewsletterGroupData[];
}
