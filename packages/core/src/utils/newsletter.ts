import { NewsletterStatus } from '@beabee/beabee-common';

import { Contact } from '#models';
import { ContactNewsletterUpdates, UpdateNewsletterContact } from '#type';

import { getContributionDescription } from './contact';

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
  opts?: { mergeGroups?: boolean }
): UpdateNewsletterContact | undefined {
  let newStatus = updates?.newsletterStatus || contact.profile.newsletterStatus;
  if (
    newStatus === NewsletterStatus.None &&
    contact.profile.newsletterStatus === NewsletterStatus.None
  ) {
    return undefined;
  }

  // Prevent newsletter status of subscribed users being set back to pending
  if (
    contact.profile.newsletterStatus === NewsletterStatus.Subscribed &&
    newStatus === NewsletterStatus.Pending
  ) {
    newStatus = NewsletterStatus.Subscribed;
  }

  const groups = updates?.newsletterGroups
    ? opts?.mergeGroups
      ? [
          ...contact.profile.newsletterGroups,
          ...updates.newsletterGroups,
        ].filter((v, i, a) => a.indexOf(v) === i)
      : updates.newsletterGroups
    : contact.profile.newsletterGroups;

  return {
    email: contact.email,
    status: newStatus,
    groups,
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
