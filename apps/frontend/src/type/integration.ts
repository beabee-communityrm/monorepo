import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type IntegrationStatus = 'connected' | 'connectionLost' | 'disabled';

export interface IntegrationGroup {
  name: string;
  id: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  status: IntegrationStatus;
  color: string;
  textColor?: string;
  icon?: IconDefinition;
  audienceId?: string;
  groups?: IntegrationGroup[];
}
