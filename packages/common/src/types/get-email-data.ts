export interface GetEmailData {
  id: string;
  name: string;
  subject: string;
  body: string;
  date: string;
  isSystem?: boolean;
  systemTemplateId?: string;
}
