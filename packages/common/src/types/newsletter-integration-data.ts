import { ApiHealthStatus } from '../data/index.js';
import { NewsletterGroupData } from './newsletter-group-data.js';

export interface NewsletterIntegrationData {
  provider: string;
  status: ApiHealthStatus;
  audienceId?: string;
  groups?: NewsletterGroupData[];
}
