import type { ContactMfaData } from '@type/contact-mfa-data';

export interface CreateContactMfaData extends ContactMfaData {
  secret: string;
  /** The code from the authenticator app */
  token: string;
}
