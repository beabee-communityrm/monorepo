import type { OngoingEmailFields } from './ongoing-email-fields.js';

export interface CreateEmailData {
  name: string;
  fromName?: string;
  fromEmail?: string;
  subject: string;
  body: string;
  ongoingEmail?: OngoingEmailFields;
}
