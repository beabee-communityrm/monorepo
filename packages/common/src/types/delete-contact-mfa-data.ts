import type { ContactMfaData } from "./contact-mfa-data.js";

export interface DeleteContactMfaData extends ContactMfaData {
  /** The code from the authenticator app */
  token?: string;
}
