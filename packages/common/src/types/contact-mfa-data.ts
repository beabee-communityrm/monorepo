import { CONTACT_MFA_TYPE } from "../data/index.ts";

/**
 * Contact multi factor authentication data
 * TODO: Move to common
 */
export interface ContactMfaData {
  type: CONTACT_MFA_TYPE;
}