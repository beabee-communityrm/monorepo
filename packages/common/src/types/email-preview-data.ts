/**
 * Email preview data containing rendered subject and body
 * Used for preview endpoints where merge fields are replaced
 */
export interface EmailPreviewData {
  subject: string;
  body: string;
}
