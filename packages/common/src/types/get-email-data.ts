/**
 * Full email entity data with metadata
 * Used for CRUD operations on email entities
 */
export interface GetEmailData {
  id: string;
  name: string;
  fromName: string | null;
  fromEmail: string | null;
  subject: string;
  body: string;
  date: string;
  assignedTemplates: string[];
  mailingCount?: number;
}
