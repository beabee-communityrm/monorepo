/**
 * Full email entity data with metadata
 * Used for CRUD operations on email entities
 */
export interface GetEmailData {
  id: string;
  /** Template ID if this is a system template override, undefined for custom emails */
  templateId?: string;
  name: string;
  fromName: string | null;
  fromEmail: string | null;
  subject: string;
  body: string;
  date: string;
  mailingCount?: number;
}
