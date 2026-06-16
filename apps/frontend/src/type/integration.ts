import type { MailchimpNewsletterIntegrationDataWith } from '@beabee/beabee-common';
import { ApiHealthStatus } from '@beabee/beabee-common';

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
export interface MailchimpIntegration
  extends
    IntegrationDisplayProps,
    MailchimpNewsletterIntegrationDataWith<'health'> {}

export type Integration = DisabledIntegration | MailchimpIntegration;
