import { NewsletterStatus } from '@beabee/beabee-common';

import { Contact } from '#models';
import {
  ContactNewsletterUpdates,
  NewsletterGroupChange,
  UpdateNewsletterContact,
} from '#type';

import { getContributionDescription } from './contact.js';

/**
 * Convert a contact to a newsletter update object that can be sent to the
 * newsletter provider
 *
 * @param contact The contact
 * @returns A newsletter contact update
 */
export function convertContactToNlUpdate(
  contact: Contact,
  updates?: ContactNewsletterUpdates,
  opts?: { newsletterGroupChange?: NewsletterGroupChange }
): UpdateNewsletterContact | undefined {
  let newStatus = updates?.status || contact.newsletter.status;
  if (
    newStatus === NewsletterStatus.None &&
    contact.newsletter.status === NewsletterStatus.None
  ) {
    return undefined;
  }

  // Prevent newsletter status of subscribed users being set back to pending
  if (
    contact.newsletter.status === NewsletterStatus.Subscribed &&
    newStatus === NewsletterStatus.Pending
  ) {
    newStatus = NewsletterStatus.Subscribed;
  }

  return {
    email: contact.email,
    status: newStatus,
    groups: updates?.groups,
    newsletterGroupChange: opts?.newsletterGroupChange,
    firstname: contact.firstname,
    lastname: contact.lastname,
    fields: {
      REFCODE: contact.referralCode || '',
      POLLSCODE: contact.pollsCode || '',
      C_DESC: getContributionDescription(
        contact.contributionType,
        contact.contributionMonthlyAmount,
        contact.contributionPeriod
      ),
      C_MNTHAMT: contact.contributionMonthlyAmount?.toFixed(2) || '',
      C_PERIOD: contact.contributionPeriod || '',
    },
    isActiveMember: contact.membership?.isActive || false,
    isActiveUser: !!contact.password.hash,
  };
}
