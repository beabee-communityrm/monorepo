import type { ContactMfaData } from "./contact-mfa-data.ts";

export interface DeleteContactMfaData extends ContactMfaData {
  /** The code from the authenticator app */
  token?: string;
}
