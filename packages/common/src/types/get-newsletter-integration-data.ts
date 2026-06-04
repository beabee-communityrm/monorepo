export interface NewsletterIntegrationGroup {
  label: string;
  id: string;
}

export interface NewsletterIntegration {
  provider: string;
  status: 'healthy' | 'unhealthy';
  audienceId?: string;
  groups?: NewsletterIntegrationGroup[];
}
