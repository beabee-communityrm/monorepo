import type { OngoingEmailFields } from './ongoing-email-fields.js';

export interface CreateEmailData {
  name: string;
  fromName: string | null;
  fromEmail: string | null;
  subject: string;
  body: string;
  ongoingEmail?: OngoingEmailFields;
}
