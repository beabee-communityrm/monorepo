import { type RoleType } from '@beabee/beabee-common';

import type { GetContactData } from './get-contact-data.js';

interface AuthInfoNoneData {
  method: 'none';
  contact?: undefined;
  roles: RoleType[]; // Should be empty
}

/**
 * Pages at the identity provider where the member manages their login,
 * only present when login is handled by an identity provider
 */
export interface AuthInfoSelfServiceData {
  changePassword: string;
  addPasskey: string;
  setupMfa: string;
}

interface AuthInfoContactData {
  method: 'user';
  contact: GetContactData;
  roles: RoleType[];
  selfService?: AuthInfoSelfServiceData;
}

interface AuthInfoApiKeyData {
  method: 'api-key';
  contact?: GetContactData;
  roles: RoleType[];
}

interface AuthInfoInternalData {
  method: 'internal';
  contact?: undefined;
  roles: RoleType[];
}

export type AuthInfoData =
  | AuthInfoNoneData
  | AuthInfoContactData
  | AuthInfoApiKeyData
  | AuthInfoInternalData;
