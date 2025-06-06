import { CONTACT_MFA_TYPE } from '@beabee/beabee-common';

export interface DeleteContactMfaData {
  type: CONTACT_MFA_TYPE;
  token?: string;
}
