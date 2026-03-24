import type { OngoingEmailFields } from './ongoing-email-fields.js';

/**
 * Data for updating an email.
 * All fields are optional to support partial updates (e.g. toggling enabled).
 */
export interface UpdateEmailData {
  name?: string;
  fromName?: string;
  fromEmail?: string;
  subject?: string;
  body?: string;
  ongoingEmail?: OngoingEmailFields;
}
