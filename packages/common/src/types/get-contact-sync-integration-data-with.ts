import { ApiHealthStatus } from '../index.js';
import type {
  ContactSyncIntegrationData,
  GetContactSyncWith,
  Noop,
  SalesforceContactSyncIntegrationData,
} from './index.js';

export type ContactSyncIntegrationDataWith<With extends GetContactSyncWith> =
  ContactSyncIntegrationData &
    ('health' extends With ? { status: ApiHealthStatus } : Noop);

export type SalesforceContactSyncIntegrationDataWith<
  With extends GetContactSyncWith,
> = SalesforceContactSyncIntegrationData &
  ('health' extends With ? { status: ApiHealthStatus } : Noop);
