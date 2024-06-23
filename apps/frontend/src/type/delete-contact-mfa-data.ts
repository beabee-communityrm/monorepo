import type { ContactMfaData } from '@beabee/beabee-common';

export interface DeleteContactMfaData extends ContactMfaData {
  /** The code from the authenticator app */
  token?: string;
}
