import type { NewsletterStatus } from '@beabee/beabee-common';

export interface ContactNewsletterUpdates {
  newsletterStatus?: NewsletterStatus | undefined;
  newsletterGroups?: string[] | undefined;
}
