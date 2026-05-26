import type {
  EmailPreviewData,
  EmailTemplateType,
  GetEmailData,
  GetEmailTemplateInfoData,
  UpdateEmailData,
} from '@beabee/beabee-common';

import type { BaseClientOptions, PreviewEmailOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing email template operations
 * Handles system email templates and their overrides
 * @extends BaseClient
 */
export class EmailTemplateClient extends BaseClient {
  /**
   * Creates a new email template client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/email'),
    });
  }

  /**
   * Get all email templates with metadata
   * @returns Array of template info with override status
   */
  async list(): Promise<GetEmailTemplateInfoData[]> {
    const { data } =
      await this.fetch.get<GetEmailTemplateInfoData[]>('/templates');
    return data;
  }

  /**
   * Get a template email (override or default)
   * @param templateId - The template ID (e.g., 'welcome', 'reset-password')
   * @returns The template email data
   */
  async get(templateId: string): Promise<GetEmailData> {
    const { data } = await this.fetch.get<GetEmailData>(
      `/template/${templateId}`
    );
    return data;
  }

  /**
   * Create or update a template override
   * @param templateId - The template ID
   * @param updateData - The subject and body to override
   * @returns The updated template override
   */
  async update(
    templateId: string,
    updateData: UpdateEmailData
  ): Promise<GetEmailData> {
    const { data } = await this.fetch.put<GetEmailData>(
      `/template/${templateId}`,
      updateData
    );
    return data;
  }

  /**
   * Delete a template override (reset to default)
   * @param templateId - The template ID
   */
  async delete(templateId: string): Promise<void> {
    await this.fetch.delete(`/template/${templateId}`);
  }

  /**
   * Preview an email template with custom merge fields
   * Supports all template types (general, contact, admin)
   *
   * @param type - The template type ('general', 'contact', or 'admin')
   * @param templateId - The template ID (e.g., 'callout-response-answers', 'welcome', 'new-member')
   * @param options - Preview options including merge fields, custom subject, and locale
   * @returns The preview with merge fields replaced
   *
   * @example
   * // Preview a contact template
   * await client.email.template.preview('contact', 'callout-response-answers', {
   *   mergeFields: { CALLOUTTITLE: 'My Callout' },
   *   customSubject: 'Thank you for your response'
   * });
   *
   * @example
   * // Preview a general template
   * await client.email.template.preview('general', 'confirm-email', {
   *   mergeFields: { CONFIRMLINK: 'https://example.com/confirm' }
   * });
   *
   * @example
   * // Preview an admin template (requires admin role)
   * await client.email.template.preview('admin', 'new-member', {
   *   mergeFields: { MEMBERID: '123', MEMBERNAME: 'John Doe' }
   * });
   */
  async preview(
    type: EmailTemplateType,
    templateId: string,
    options: PreviewEmailOptions = {}
  ): Promise<EmailPreviewData> {
    const { data } = await this.fetch.post<EmailPreviewData>(
      `/preview/${type}/${templateId}`,
      options
    );
    return data;
  }
}
