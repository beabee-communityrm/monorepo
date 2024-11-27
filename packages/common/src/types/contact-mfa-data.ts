import { CONTACT_MFA_TYPE } from "../data/contact-mfa-type.ts";

/**
 * Contact multi factor authentication data
 * TODO: Move to common
 */
export interface ContactMfaData {
  type: CONTACT_MFA_TYPE;
}
