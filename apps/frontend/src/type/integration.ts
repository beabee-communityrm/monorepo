import { ApiHealthStatus } from '@beabee/beabee-common';
import type { NewsletterGroupData } from '@beabee/beabee-common';

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/** Display properties frontend-mapped from the provider identifier */
interface IntegrationDisplayProps {
  name: string;
  category: string;
  color: string;
  textColor?: string;
  icon?: IconDefinition;
}

/** Any provider that is not yet configured */
export interface DisabledIntegration extends IntegrationDisplayProps {
  provider: string;
  status: ApiHealthStatus.DISABLED;
}

/** Mailchimp provider, active with full audience/group data */
export interface NewsletterIntegration extends IntegrationDisplayProps {
  provider: string;
  status: ApiHealthStatus;
  audienceId: string;
  groups: NewsletterGroupData[];
}

export type Integration = DisabledIntegration | NewsletterIntegration;
