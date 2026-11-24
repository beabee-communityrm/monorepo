import { NewsletterStatus } from '@beabee/beabee-common';

import { NewsletterGroupChange } from './newsletter-group-change.js';

export interface UpdateNewsletterContact {
  email: string;
  status: NewsletterStatus;
  firstname: string;
  lastname: string;
  /**
   * The group IDs this update concerns. Omitted entirely if the update
   * doesn't touch group membership at all — the provider should then leave
   * group membership untouched rather than reaffirming it.
   */
  groups?: string[] | undefined;
  /**
   * How `groups` should be applied. Defaults to 'replace' when `groups` is
   * set. See `NewsletterGroupChange` for what each option does.
   */
  newsletterGroupChange?: NewsletterGroupChange | undefined;
  /**
   * The contact's status and groups in beabee before this update. Only a
   * provider that beabee alone writes to can rely on it; one whose state also
   * changes on the provider's side must read that state back instead.
   */
  previous?: { status: NewsletterStatus; groups: string[] } | undefined;
  fields: Record<string, string>;
  isActiveMember: boolean;
  isActiveUser: boolean;
}
