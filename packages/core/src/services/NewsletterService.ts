import { NewsletterStatus } from "@beabee/beabee-common";

import { getRepository } from "#database";
import { log as mainLogger } from "#logging";

import {
  ContactNewsletterUpdates,
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact
} from "#type/index";
import MailchimpProvider from "#providers/newsletter/MailchimpProvider";
import NoneProvider from "#providers/newsletter/NoneProvider";

import { Contact, ContactProfile } from "#models/index";

import config from "#config/config";
import { getContributionDescription } from "#utils/contact";

const log = mainLogger.child({ app: "newsletter-service" });

function shouldUpdate(updates: ContactNewsletterUpdates): boolean {
  return !!(
    updates.email ||
    updates.firstname ||
    updates.lastname ||
    updates.referralCode ||
    updates.pollsCode ||
    updates.contributionPeriod ||
    updates.contributionMonthlyAmount ||
    updates.newsletterStatus ||
    updates.newsletterGroups
  );
}

async function contactToNlUpdate(
  contact: Contact,
  updates?: ContactNewsletterUpdates
): Promise<[NewsletterStatus, UpdateNewsletterContact | undefined]> {
  // TODO: Fix that it relies on contact.profile being loaded
  if (!contact.profile) {
    contact.profile = await getRepository(ContactProfile).findOneByOrFail({
      contactId: contact.id
    });
  }

  const nlContact = {
    email: updates?.email || contact.email,
    status: updates?.newsletterStatus || contact.profile.newsletterStatus,
    groups: updates?.newsletterGroups || contact.profile.newsletterGroups,
    firstname: updates?.firstname || contact.firstname,
    lastname: updates?.lastname || contact.lastname,
    fields: {
      REFCODE: updates?.referralCode || contact.referralCode || "",
      POLLSCODE: updates?.pollsCode || contact.pollsCode || "",
      C_DESC: getContributionDescription(
        contact.contributionType,
        updates?.contributionMonthlyAmount || contact.contributionMonthlyAmount,
        updates?.contributionPeriod || contact.contributionPeriod
      ),
      C_MNTHAMT:
        updates?.contributionMonthlyAmount?.toFixed(2) ||
        contact.contributionMonthlyAmount?.toFixed(2) ||
        "",
      C_PERIOD: updates?.contributionPeriod || contact.contributionPeriod || ""
    }
  };

  return nlContact.status === NewsletterStatus.None
    ? [NewsletterStatus.None, undefined]
    : [contact.profile.newsletterStatus, nlContact];
}

async function getValidNlUpdates(
  contacts: Contact[]
): Promise<UpdateNewsletterContact[]> {
  const nlUpdates = [];
  for (const contact of contacts) {
    const [, nlUpdate] = await contactToNlUpdate(contact);
    if (nlUpdate) {
      nlUpdates.push(nlUpdate);
    }
  }
  return nlUpdates;
}

class NewsletterService {
  private readonly provider: NewsletterProvider =
    config.newsletter.provider === "mailchimp"
      ? new MailchimpProvider(config.newsletter.settings)
      : new NoneProvider();

  async addTagToContacts(contacts: Contact[], tag: string): Promise<void> {
    log.info(`Add tag ${tag} to ${contacts.length} contacts`);
    await this.provider.addTagToContacts(
      (await getValidNlUpdates(contacts)).map((m) => m.email),
      tag
    );
  }

  async removeTagFromContacts(contacts: Contact[], tag: string): Promise<void> {
    log.info(`Remove tag ${tag} from ${contacts.length} contacts`);
    await this.provider.removeTagFromContacts(
      (await getValidNlUpdates(contacts)).map((m) => m.email),
      tag
    );
  }

  async upsertContact(
    contact: Contact,
    updates?: ContactNewsletterUpdates,
    oldEmail?: string
  ): Promise<
    | {
        oldStatus: NewsletterStatus;
        newStatus: NewsletterStatus;
      }
    | undefined
  > {
    const willUpdate = !updates || shouldUpdate(updates);
    if (!willUpdate) {
      return;
    }

    const [oldStatus, nlUpdate] = await contactToNlUpdate(contact, updates);
    if (nlUpdate) {
      log.info("Upsert contact " + contact.id);
      const newStatus = await this.provider.upsertContact(nlUpdate, oldEmail);
      return { oldStatus, newStatus };
    } else {
      log.info("Ignoring contact update for " + contact.id);
    }
  }

  async upsertContacts(contacts: Contact[]): Promise<void> {
    log.info(`Upsert ${contacts.length} contacts`);
    await this.provider.upsertContacts(await getValidNlUpdates(contacts));
  }

  async updateContactFields(
    contact: Contact,
    fields: Record<string, string>
  ): Promise<void> {
    log.info(`Update contact fields for ${contact.id}`, fields);
    const [, nlUpdate] = await contactToNlUpdate(contact);
    if (nlUpdate) {
      // TODO: should be an update without status
      await this.provider.upsertContact({
        email: nlUpdate.email,
        status: nlUpdate.status,
        fields
      });
    } else {
      log.info("Ignoring contact field update for " + contact.id);
    }
  }

  async archiveContacts(contacts: Contact[]): Promise<void> {
    log.info(`Archive ${contacts.length} contacts`);
    await this.provider.archiveContacts(
      (await getValidNlUpdates(contacts)).map((m) => m.email)
    );
  }

  /**
   * Permanently remove contacts from the newsletter provider
   *
   * @param contacts The contacts to delete
   */
  async permanentlyDeleteContacts(contacts: Contact[]): Promise<void> {
    log.info(`Delete ${contacts.length} contacts`);
    await this.provider.permanentlyDeleteContacts(
      (await getValidNlUpdates(contacts)).map((m) => m.email)
    );
  }

  async getNewsletterContact(
    email: string
  ): Promise<NewsletterContact | undefined> {
    return await this.provider.getContact(email);
  }

  async getNewsletterContacts(): Promise<NewsletterContact[]> {
    return await this.provider.getContacts();
  }
}

export default new NewsletterService();
