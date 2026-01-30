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

  /** One-off email to all contacts in the segment (admin). */
  async send(
    segmentId: string,
    data: { subject: string; body: string }
  ): Promise<void> {
    await this.fetch.post(`/${segmentId}/email/send`, data);
  }
}
