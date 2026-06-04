import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { NewsletterIntegrationGroup } from '@beabee/beabee-common';

export type { NewsletterIntegrationGroup };

export type IntegrationStatus = 'healthy' | 'unhealthy' | 'disabled';

/**
 * Display type used by integration card components.
 * Combines API data with frontend-mapped display properties.
 */
export interface Integration {
  provider: string;
  name: string;           // frontend-mapped from provider
  category: string;       // frontend-mapped from endpoint
  status: IntegrationStatus;
  color: string;          // frontend-mapped
  textColor?: string;     // frontend-mapped
  icon?: IconDefinition;  // frontend-mapped
  audienceId?: string;
  groups?: NewsletterIntegrationGroup[];
}
