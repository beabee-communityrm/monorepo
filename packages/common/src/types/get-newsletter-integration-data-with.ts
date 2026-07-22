import { ApiHealthStatus } from '../index.js';
import type {
  GetNewsletterWith,
  MailchimpNewsletterIntegrationData,
  NewsletterIntegrationData,
  Noop,
  SalesforceNewsletterIntegrationData,
  TestNewsletterIntegrationData,
} from './index.js';

export type NewsletterIntegrationDataWith<With extends GetNewsletterWith> =
  NewsletterIntegrationData &
    ('health' extends With ? { status: ApiHealthStatus } : Noop);

export type MailchimpNewsletterIntegrationDataWith<
  With extends GetNewsletterWith,
> = MailchimpNewsletterIntegrationData &
  ('health' extends With ? { status: ApiHealthStatus } : Noop);

export type SalesforceNewsletterIntegrationDataWith<
  With extends GetNewsletterWith,
> = SalesforceNewsletterIntegrationData &
  ('health' extends With ? { status: ApiHealthStatus } : Noop);

export type TestNewsletterIntegrationDataWith<With extends GetNewsletterWith> =
  TestNewsletterIntegrationData &
    ('health' extends With ? { status: ApiHealthStatus } : Noop);
