import { RoleType } from '@beabee/beabee-common';
import type { GetContactData } from './get-contact-data';

interface AuthInfoNoneData {
  method: 'none';
  contact?: undefined;
  roles: RoleType[]; // Should be empty
}

interface AuthInfoContactData {
  method: 'user';
  contact: GetContactData;
  roles: RoleType[];
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
