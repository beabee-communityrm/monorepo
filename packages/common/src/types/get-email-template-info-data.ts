export interface GetEmailTemplateInfoData {
  id: string;
  type: 'general' | 'admin' | 'contact';
  mergeFields: string[];
  overrideEmailId?: string;
}
