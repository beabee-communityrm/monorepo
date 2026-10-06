/** Integrations that expose a health check via the CLI */
export type HealthIntegration =
  | 'contact-sync'
  | 'document'
  | 'image'
  | 'newsletter'
  | 'payment'
  | 'email';
