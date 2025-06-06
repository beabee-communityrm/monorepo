import { BaseClient } from './base.client.js';
import { cleanUrl } from '../utils/index.js';
import type { BaseClientOptions } from '../types/index.js';
import type { HealthCheckData } from '@beabee/beabee-common';

/**
 * Client for checking the health status of the Beabee API
 * Provides simple health check functionality to verify API availability
 * @extends BaseClient
 */
export class HealthClient extends BaseClient {
  /**
   * Creates a new health client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/health'),
    });
  }

  /**
   * Checks the health status of the API
   * @returns Health check data including status and service availability
   * @throws {ClientApiError} If the API is unreachable
   */
  async check(): Promise<HealthCheckData> {
    const { data } = await this.fetch.get<HealthCheckData>('');

    // Deserialize timestamp
    return {
      ...data,
      timestamp: BaseClient.deserializeDate(data.timestamp),
    };
  }
}
