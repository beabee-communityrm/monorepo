import type {
  CreateEmailData,
  EmailPreviewData,
  GetEmailData,
  ListEmailsQuery,
  Paginated,
  UpdateEmailData,
} from '@beabee/beabee-common';

import type { BaseClientOptions, PreviewEmailOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { EmailTemplateClient } from './email-template.client.js';

/**
 * Client for managing email operations
 * Handles custom emails and provides access to template operations via sub-client
 * @extends BaseClient
 */
export class EmailClient extends BaseClient {
  /** Sub-client for managing email templates and overrides */
  template: EmailTemplateClient;

  /**
   * Creates a new email client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/email'),
    });
    this.template = new EmailTemplateClient(options);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Custom Email Operations
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * List all custom emails with pagination
   * @param query - Pagination query parameters
   * @returns Paginated list of custom emails
   */
  async list(query?: ListEmailsQuery): Promise<Paginated<GetEmailData>> {
    const { data } = await this.fetch.get<Paginated<GetEmailData>>(
      '/',
      query || {}
    );
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
   * Get a custom email by UUID
   * @param id - The email UUID
   * @returns The email data
   */
  async get(id: string): Promise<GetEmailData> {
    const { data } = await this.fetch.get<GetEmailData>(`/${id}`);
    return data;
  }

  /**
   * Update an existing custom email
   * @param id - The email UUID
   * @param updateData - The update data
   * @returns The updated email data
   */
  async update(id: string, updateData: UpdateEmailData): Promise<GetEmailData> {
    const { data } = await this.fetch.put<GetEmailData>(`/${id}`, updateData);
    return data;
  }

  /**
   * Delete a custom email and its associated mailings
   * @param id - The email UUID
   */
  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Preview Operations
  // ─────────────────────────────────────────────────────────────────────────────

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
   * @deprecated Use client.email.template.preview() instead
   * @param type - The template type ('general', 'contact', or 'admin')
   * @param templateId - The template ID
   * @param options - Preview options
   * @returns The preview with merge fields replaced
   */
  async previewTemplate(
    type: 'general' | 'contact' | 'admin',
    templateId: string,
    options: PreviewEmailOptions = {}
  ): Promise<EmailPreviewData> {
    return this.template.preview(type, templateId, options);
  }
}
