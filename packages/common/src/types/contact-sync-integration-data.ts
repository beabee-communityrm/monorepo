import { ApiHealthStatus } from '../data/index.js';

export interface NoneContactSyncIntegrationData {
  provider: 'none';
  status?: ApiHealthStatus.DISABLED;
}

export interface SalesforceContactSyncIntegrationData {
  provider: 'salesforce';
  status?: ApiHealthStatus;
}

export type ContactSyncIntegrationData =
  | NoneContactSyncIntegrationData
  | SalesforceContactSyncIntegrationData;
