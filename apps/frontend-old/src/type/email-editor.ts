import type { EmailTemplateType } from '@beabee/beabee-common';

/**
 * EmailServerRenderConfig interface defines the configuration for server-side email preview
 */
export interface EmailTemplateConfig {
  /** Email type identifier (e.g., 'contact', 'general', 'admin') */
  type: EmailTemplateType;
  /** Template identifier (e.g., 'welcome') */
  id: string;
}

/**
 * EmailPreviewResult interface defines the structure of server-rendered preview result
 */
export interface EmailPreviewResult {
  subject: string;
  body: string;
}
