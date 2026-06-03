import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type IntegrationStatus = 'connected' | 'connectionLost' | 'disabled';

export interface IntegrationGroup {
  name: string;
  id: string;
}

export interface Integration {
  provider: string;
  name: string;        // frontend-mapped from provider
  category: string;    // frontend-mapped from endpoint
  status: IntegrationStatus;
  color: string;       // frontend-mapped
  textColor?: string;  // frontend-mapped
  icon?: IconDefinition; // frontend-mapped
  audienceId?: string;
  groups?: IntegrationGroup[];
}
