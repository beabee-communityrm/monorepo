/**
 * EditableEmailTemplate interface defines the structure of an editable email template
 * - subject: The email subject line
 * - content: The editable content (could be full body or just a merge field)
 */
export interface EditableEmailTemplate {
  subject: string;
  content: string;
}

/**
 * EmailServerRenderConfig interface defines the configuration for server-side email preview
 */
export interface EmailServerRenderConfig {
  /** Email type identifier (e.g., 'contact', 'general', 'admin') */
  type: string;
  /** Optional template identifier (e.g., 'callout-response-answers') */
  templateId?: string;
}

/**
 * EmailPreviewResult interface defines the structure of server-rendered preview result
 */
export interface EmailPreviewResult {
  subject: string;
  body: string;
}
