export interface GetEmailWithMetadataData {
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
