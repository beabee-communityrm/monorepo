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
