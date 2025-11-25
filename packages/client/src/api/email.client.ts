import type { GetEmailData, UpdateEmailData } from '@beabee/beabee-common';

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
   * Retrieves email data by ID
   * @param id - The email ID to fetch
   * @returns The email data
   */
  async get(id: string): Promise<GetEmailData> {
    const { data } = await this.fetch.get<GetEmailData>(`/${id}`);
    return data;
  }

  /**
   * Updates an existing email
   * @param id - The email ID to update
   * @param data - The update data for the email
   * @returns The updated email data
   */
  async update(id: string, data: UpdateEmailData): Promise<GetEmailData> {
    const { data: responseData } = await this.fetch.put<GetEmailData>(
      `/${id}`,
      data
    );
    return responseData;
  }

  /**
   * Preview an email with custom merge fields
   *
   * @param options Preview options including merge fields, custom subject and body
   * @returns The preview with merge fields replaced
   */
  async preview(options: PreviewEmailOptions): Promise<GetEmailData> {
    const { data } = await this.fetch.post<GetEmailData>(`/preview`, options);
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
  ): Promise<GetEmailData> {
    const { data } = await this.fetch.post<GetEmailData>(
      `/preview/${type}/${templateId}`,
      options
    );
    return data;
  }
}
