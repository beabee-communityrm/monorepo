import type { ContactMfaData } from '@type/contact-mfa-data';

export interface DeleteContactMfaData extends ContactMfaData {
  /** The code from the authenticator app */
  token?: string;
}
