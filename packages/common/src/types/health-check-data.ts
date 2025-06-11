/**
 * Health check data returned by the API health endpoint
 */
export interface HealthCheckData {
  status: 'ok' | 'error';
  timestamp: Date;
  services: {
    database: boolean;
  };
}
