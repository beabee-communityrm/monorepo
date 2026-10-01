import type {
  MailchimpNewsletterIntegrationDataWith,
  SalesforceNewsletterIntegrationDataWith,
  TestNewsletterIntegrationDataWith,
} from '@beabee/beabee-common';
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

/** Salesforce provider, active with full audience/group data */
export interface SalesforceIntegration
  extends
    IntegrationDisplayProps,
    SalesforceNewsletterIntegrationDataWith<'health'> {}

/** Test provider, always healthy and has audience/group data */
export interface TestProviderIntegration
  extends
    IntegrationDisplayProps,
    TestNewsletterIntegrationDataWith<'health'> {}

export type Integration =
  | DisabledIntegration
  | MailchimpIntegration
  | SalesforceIntegration
  | TestProviderIntegration;
