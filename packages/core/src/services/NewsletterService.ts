import { NewsletterStatus } from '@beabee/beabee-common';

import config from '#config/config';
import { getRepository } from '#database';
import { CantUpdateNewsletterContact } from '#errors/CantUpdateNewsletterContact';
import { log as mainLogger } from '#logging';
import { Contact, ContactProfile } from '#models/index';
import { MailchimpProvider, NoneProvider } from '#providers/newsletter/index';
import {
  ContactNewsletterUpdates,
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
} from '#type/index';
import { getContributionDescription } from '#utils/contact';

const log = mainLogger.child({ app: 'newsletter-service' });

/**
 * Convert a contact to a newsletter update object that can be sent to the
 * newsletter provider
 *
 * @param contact The contact
 * @returns A newsletter contact update
 */
export async function contactToNlUpdate(
  contact: Contact,
  updates?: ContactNewsletterUpdates,
  opts?: { mergeGroups?: boolean }
): Promise<UpdateNewsletterContact | undefined> {
  // TODO: Fix that it relies on contact.profile being loaded
  if (!contact.profile) {
    contact.profile = await getRepository(ContactProfile).findOneByOrFail({
      contactId: contact.id,
    });
  }

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

class NewsletterService {
  private readonly provider: NewsletterProvider =
    config.newsletter.provider === 'mailchimp'
      ? new MailchimpProvider(config.newsletter.settings)
      : new NoneProvider();

  /**
   * Updates or inserts a contact in the newsletter provider and handles status
   * changes. The contact should have already been updated before calling this
   * method, the updates parameter is just a way to flag the relevant changes
   *
   * @param contact The contact to update or insert
   * @param updates Optional updates to apply to the contact before syncing
   * @param oldEmail Previous email address if the email is being updated
   */
  async upsertContact(
    contact: Contact,
    updates?: ContactNewsletterUpdates,
    opts?: {
      oldEmail?: string;
      mergeGroups?: boolean;
    }
  ): Promise<void> {
    const nlUpdate = await contactToNlUpdate(contact, updates, opts);
    if (!nlUpdate) {
      log.info('Ignoring contact update for ' + contact.id);
      return;
    }

    let newState = { status: NewsletterStatus.None, groups: [] as string[] };

    if (nlUpdate.status !== NewsletterStatus.None) {
      try {
        log.info('Upsert contact ' + contact.id);
        newState = await this.provider.upsertContact(nlUpdate, opts?.oldEmail);

        log.info(
          `Got newsletter groups and status ${newState.status} for contact ${contact.id}`,
          { groups: newState.groups }
        );
      } catch (err) {
        // The newsletter provider rejected the update, set this contact's
        // newsletter status to None to prevent further updates
        if (err instanceof CantUpdateNewsletterContact) {
          log.warning(
            `Newsletter upsert failed, setting status to none for contact ${contact.id}`,
            err
          );
        } else {
          throw err;
        }
      }
    }

    // TODO: remove dependency on ContactProfile
    await getRepository(ContactProfile).update(contact.id, {
      newsletterStatus: newState.status,
      newsletterGroups: newState.groups,
    });
    contact.profile.newsletterStatus = newState.status;
    contact.profile.newsletterGroups = newState.groups;
  }

  /**
   * Update the merge fields of a contact in the newsletter provider. This
   * method merges the field updates with the contact's current fields, so it
   * overwrites any existing fields with the new values, but does not remove any
   * fields that are not included in the update.
   *
   * @param contact The contact to update
   * @param fields The fields to set
   */
  async updateContactFields(
    contact: Contact,
    fields: Record<string, string>
  ): Promise<void> {
    log.info(`Update contact fields for ${contact.id}`, fields);
    const nlUpdate = await contactToNlUpdate(contact);
    if (nlUpdate) {
      await this.provider.updateContactFields(nlUpdate.email, fields);
    } else {
      log.info('Ignoring contact field update for ' + contact.id);
    }
  }

  /**
   * Permanently remove a contact from the newsletter provider
   *
   * @param contact The contact to delete
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    log.info(`Delete contact ${contact.id}`);
    const nlUpdate = await contactToNlUpdate(contact);
    if (nlUpdate) {
      await this.provider.permanentlyDeleteContact(nlUpdate.email);
    }
  }

  /**
   * Get a single newsletter contact from the newsletter provider
   *
   * @param email The contact's email address
   * @returns The newsletter contact
   */
  async getNewsletterContact(
    email: string
  ): Promise<NewsletterContact | undefined> {
    return await this.provider.getContact(email);
  }
}

export const newsletterService = new NewsletterService();
export default newsletterService;
