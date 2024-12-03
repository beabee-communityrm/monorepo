import type { ContactMfaData } from "./contact-mfa-data.js";

export interface CreateContactMfaData extends ContactMfaData {
  secret: string;
  /** The code from the authenticator app */
  token: string;
}
