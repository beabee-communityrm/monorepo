import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for segment-scoped email operations (e.g. send one-off email to segment).
 * Obtained via segments.email.
 */
export class SegmentEmailClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/segments'),
    });
  }

  /**
   * Send one-off email to all segment contacts (admin). With emailId, uses saved template and creates a mailing record for tracking.
   * @param segmentId Segment ID
   * @param data Subject and body (merge fields supported). Optional emailId to use a saved template.
   */
  async send(
    segmentId: string,
    data: { subject: string; body: string; emailId?: string }
  ): Promise<void> {
    await this.fetch.post(`/${segmentId}/email/send`, data);
  }
}
