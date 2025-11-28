import type {
  AssignTemplateData,
  CreateEmailData,
  EmailPreviewData,
  GetEmailData,
  GetEmailTemplateInfoData,
  ListEmailsQuery,
  Paginated,
  UpdateEmailData,
} from '@beabee/beabee-common';

import type { BaseClientOptions, PreviewEmailOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing email operations
 * Handles email retrieval and updates
 * @extends BaseClient
 */
export class EmailClient extends BaseClient {
  /**
   * Creates a new email client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/email'),
    });
  }

  /**
   * List all emails with pagination
   * @param query - Pagination query parameters
   * @returns Paginated list of emails with metadata
   */
  async list(query?: ListEmailsQuery): Promise<Paginated<GetEmailData>> {
    const { data } = await this.fetch.get<Paginated<GetEmailData>>(
      '/',
      query || {}
    );
    return data;
  }

  /**
   * Get available email templates with metadata
   * @returns Array of available email templates
   */
  async getTemplates(): Promise<GetEmailTemplateInfoData[]> {
    const { data } =
      await this.fetch.get<GetEmailTemplateInfoData[]>('/templates');
    return data;
  }

  /**
   * Create a new custom email
   * @param emailData - The email data to create
   * @returns The created email with metadata
   */
  async create(emailData: CreateEmailData): Promise<GetEmailData> {
    const { data } = await this.fetch.post<GetEmailData>('/', emailData);
    return data;
  }

  /**
   * Retrieves email data by ID
   * @param id - The email ID to fetch
   * @returns The email data with metadata
   */
  async get(id: string): Promise<GetEmailData> {
    const { data } = await this.fetch.get<GetEmailData>(`/${id}`);
    return data;
  }

  /**
   * Updates an existing email or creates a template override
   * @param id - The email ID or template ID to update
   * @param data - The update data for the email
   * @returns The updated email data with metadata
   */
  async update(id: string, data: UpdateEmailData): Promise<GetEmailData> {
    const { data: responseData } = await this.fetch.put<GetEmailData>(
      `/${id}`,
      data
    );
    return responseData;
  }

  /**
   * Delete an email or remove a template override
   * @param id - The email ID or template ID to delete
   */
  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }

  /**
   * Assign a template to an email (or unassign by passing null)
   * @param templateId - The template ID
   * @param emailId - The email ID to assign, or null to unassign
   */
  async assignTemplate(
    templateId: string,
    emailId: string | null
  ): Promise<void> {
    await this.fetch.put(`/templates/${templateId}`, {
      emailId,
    } as AssignTemplateData);
  }

  /**
   * Preview an email with custom merge fields
   *
   * @param options Preview options including merge fields, custom subject and body
   * @returns The preview with merge fields replaced
   */
  async preview(options: PreviewEmailOptions): Promise<EmailPreviewData> {
    const { data } = await this.fetch.post<EmailPreviewData>(
      `/preview`,
      options
    );
    return data;
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
   * await client.email.preview('contact', 'callout-response-answers', {
   *   mergeFields: { CALLOUTTITLE: 'My Callout' },
   *   customSubject: 'Thank you for your response'
   * });
   *
   * @example
   * // Preview a general template
   * await client.email.preview('general', 'confirm-email', {
   *   mergeFields: { CONFIRMLINK: 'https://example.com/confirm' }
   * });
   *
   * @example
   * // Preview an admin template (requires admin role)
   * await client.email.preview('admin', 'new-member', {
   *   mergeFields: { MEMBERID: '123', MEMBERNAME: 'John Doe' }
   * });
   */
  async previewTemplate(
    type: 'general' | 'contact' | 'admin',
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
