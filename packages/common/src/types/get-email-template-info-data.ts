export interface GetEmailTemplateInfoData {
  id: string;
  type: 'general' | 'admin' | 'contact';
  mergeFields: string[];
  showContactFields?: boolean;
  overrideEmailId?: string;
}
