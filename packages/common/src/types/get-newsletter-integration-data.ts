export interface NewsletterIntegrationGroup {
  label: string;
  id: string;
}

/**
 * Response from GET /integrations/newsletter
 * Status is always healthy or unhealthy — disabled is frontend-determined
 */
export interface NewsletterIntegration {
  provider: string;
  status: 'healthy' | 'unhealthy';
  audienceId?: string;
  groups?: NewsletterIntegrationGroup[];
}
