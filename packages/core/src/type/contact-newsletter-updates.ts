import { Contact, ContactProfile } from "#models";

export type ContactNewsletterUpdates = Partial<Omit<Contact, "profile">> & {
  profile?: Partial<ContactProfile>;
};
