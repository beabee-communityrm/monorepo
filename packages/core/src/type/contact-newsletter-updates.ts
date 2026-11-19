import { NewsletterStatus } from '@beabee/beabee-common';

export interface ContactNewsletterUpdates {
  status?: NewsletterStatus | undefined;
  groups?: string[] | undefined;
}
