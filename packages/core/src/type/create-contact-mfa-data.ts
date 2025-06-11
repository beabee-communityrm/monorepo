import { CONTACT_MFA_TYPE } from '@beabee/beabee-common';

export interface CreateContactMfaData {
  type: CONTACT_MFA_TYPE;
  secret: string;
  token: string;
}
